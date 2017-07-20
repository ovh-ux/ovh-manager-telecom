angular.module("managerApp").service("TelephonyMediator", function ($q, $stateParams, Telephony, TelephonyGroup,
                                                                    TelephonyLine, TelephonyGroupLinePhone,
                                                                    REDIRECT_URLS, REDIRECT_V4_HASH) {
    "use strict";

    var self = this;
    var currentGroup = null;

    self.groups = {}; // by billingAccount
    self.initDeferred = null;
    self.getAllDeferred = null;
    self.apiScheme = null;

    self.getApiScheme = function () {
        if (!self.apiScheme) {
            return Telephony.Lexi().schema().$promise.then(function (scheme) {
                self.apiScheme = scheme;
                return self.apiScheme;
            });
        }
        return $q.when(self.apiScheme);
    };

    /*= ===========================================
        =            V6 to V4 redirection            =
        ============================================*/

    self.getV6ToV4RedirectionUrl = function (constantPath) {
        var url = REDIRECT_URLS.telephonyV4 + _.get(REDIRECT_V4_HASH, constantPath);

        if ($stateParams.serviceName) {
            url = url.replace("{lineNumber}", $stateParams.serviceName);
        }
        return url.replace("{billingAccount}", $stateParams.billingAccount);
    };

    /* -----  End of V6 to V4 redirection  ------*/
    /* ------ Awesome code from perl -----------*/
    self.IsValidNumber = function (number) {
        return !!(
            number &&
                number.match(/^\+?(\d|\.| |#|-)+$/) &&
                number.length < 26 &&
                number.length > 2);
    };

    /*= =================================
        =            API MODELS            =
        ==================================*/

    self.getApiModels = function () {
        return Telephony.Lexi().schema().$promise.then(function (schemas) {
            return schemas.models;
        });
    };

    self.getApiModelEnum = function (modelName) {
        return self.getApiModels().then(function (models) {
            return models[modelName].enum;
        });
    };

    /* -----  End of API MODELS  ------*/

    /*= ============================
        =            GROUP            =
        =============================*/

    /* ----------  SERVICES  ----------*/

    self.findService = function (serviceName) {
        var tmpGroup = null;
        var tmpService = null;

        for (var billingAccount in self.groups) {
            if (self.groups.hasOwnProperty(billingAccount)) {
                tmpGroup = self.groups[billingAccount];
                tmpService = tmpGroup.getService(serviceName);
                if (tmpService) {
                    return tmpService;
                }
            }
        }
        return null;
    };

    self.getAll = function (force) {
        if (self.getAllDeferred && !force) {
            return self.getAllDeferred.promise;
        }
        self.getAllDeferred = $q.defer();

        // get billing accounts and services
        $q.all({
            groups: Telephony.Aapi().billingAccounts().$promise,
            services: Telephony.Number().Aapi().all().$promise
        }).then(function (responses) {
            // populate account groups
            var groupServices;
            angular.forEach(responses.groups, function (groupOptions) {
                // get services of group
                groupServices = _.filter(responses.services, {
                    billingAccount: groupOptions.billingAccount
                });

                // set group lines list option
                groupOptions.lines = _.filter(groupServices, {
                    type: "sip"
                });

                // set group fax list option
                groupOptions.fax = _.filter(groupServices, {
                    type: "fax"
                });

                // set group numbers list option
                groupOptions.numbers = _.filter(groupServices, {
                    type: "number"
                });

                // add group to TelephonyMediator groups
                // if group is already added, it won't be overrided
                self.addGroup(groupOptions);
            });

            self.getAllDeferred.resolve(self.groups);

            return self.groups;
        }).catch(function (error) {
            self.getAllDeferred.reject(error);
            return $q.reject(error);
        });
        return self.getAllDeferred.promise;
    };

    /* ----------  ACTIONS  ----------*/

    self.addGroup = function (groupOptions) {
        var id = groupOptions.billingAccount;
        self.groups[id] = self.groups[id] || new TelephonyGroup(groupOptions);
        return self.groups[id];
    };

    /* ----------  POPULATE NUMBERS/LINES/FAX OPTIONS  ----------*/

    /** @TODO delete when API V7 available for /telephony */
    function getLinesBatch (billingAccountKeys) {
        return $q.all(_.map(billingAccountKeys, function (key) {
            // query all line ids
            return Telephony.Line().Lexi().query({
                billingAccount: key
            }).$promise.then(function (lineIds) {
                // batch query lines (max batch size is 50)
                return $q.all(_.map(_.chunk(lineIds, 50), function (chunkIds) {
                    return Telephony.Line().Lexi().getBatch({
                        billingAccount: key,
                        serviceName: chunkIds
                    }).$promise;
                })).then(function (chunkResult) {
                    return _.flatten(chunkResult);
                });
            }, function () {
                return $q.when([]);
            }).then(function (lines) {
                // format data as an apiv7 result
                return _.map(lines, function (line) {
                    return {
                        path: "/telephony/" + key + "/line",
                        value: line.value
                    };
                });
            });
        })).then(function (result) {
            return _.flatten(result);
        });
    }

    /** @TODO delete when API V7 available for /telephony */
    function getNumbersBatch (billingAccountKeys) {
        return $q.all(_.map(billingAccountKeys, function (key) {
            // query all line ids
            return Telephony.Number().Lexi().query({
                billingAccount: key
            }).$promise.then(function (numberIds) {
                // batch query lines (max batch size is 50)
                return $q.all(_.map(_.chunk(numberIds, 50), function (chunkIds) {
                    return Telephony.Number().Lexi().getBatch({
                        billingAccount: key,
                        serviceName: chunkIds
                    }).$promise;
                })).then(function (chunkResult) {
                    return _.flatten(chunkResult);
                });
            }, function () {
                return $q.when([]);
            }).then(function (numbers) {
                // format data as an apiv7 result
                return _.map(numbers, function (number) {
                    return {
                        path: "/telephony/" + key + "/number",
                        value: number.value
                    };
                });
            });
        })).then(function (result) {
            return _.flatten(result);
        });
    }

    /** @TODO delete when API V7 available for /telephony */
    function getFaxBatch (billingAccountKeys) {
        return $q.all(_.map(billingAccountKeys, function (key) {
            // query all line ids
            return Telephony.Fax().Lexi().query({
                billingAccount: key
            }).$promise.then(function (faxIds) {
                // batch query lines (max batch size is 50)
                return $q.all(_.map(_.chunk(faxIds, 50), function (chunkIds) {
                    return Telephony.Fax().Lexi().getBatch({
                        billingAccount: key,
                        serviceName: chunkIds
                    }).$promise;
                })).then(function (chunkResult) {
                    return _.flatten(chunkResult);
                });
            }, function () {
                return $q.when([]);
            }).then(function (fax) {
                // format data as an apiv7 result
                return _.map(fax, function (oneFax) {
                    return {
                        path: "/telephony/" + key + "/fax",
                        value: oneFax.value
                    };
                });
            });
        })).then(function (result) {
            return _.flatten(result);
        });
    }

    function populateGroupOptions (billingAccounts) {
        var promise = $q.when(billingAccounts);

        if (billingAccounts.length) {
            var billingAccountKeys = _.map(billingAccounts, "key");

            /** @TODO changes when API V7 available for /telephony */
            promise = $q.all({
                // lines: Telephony.Line().Erika().query().batch("billingAccount", billingAccountKeys, ",").expand().sort(["description", "serviceName"]).execute().$promise,
                lines: getLinesBatch(billingAccountKeys),

                // numbers: Telephony.Number().Erika().query().batch("billingAccount", billingAccountKeys, ",").expand().sort(["description", "serviceName"]).execute().$promise,
                numbers: getNumbersBatch(billingAccountKeys),

                // fax: Telephony.Fax().Erika().query().batch("billingAccount", billingAccountKeys, ",").expand().sort(["description", "serviceName"]).execute().$promise
                fax: getFaxBatch(billingAccountKeys)
            }).then(function (response) {
                if (billingAccounts.length > 1) {
                    // building groups options
                    angular.forEach(billingAccounts, function (billingAccount) {

                        billingAccount.value.numbers = _.chain(response.numbers).filter(function (numberResponse) {
                            return numberResponse.value !== null && numberResponse.path === "/telephony/" + billingAccount.key + "/number";
                        }).map("value").value();

                        billingAccount.value.lines = _.chain(response.lines).filter(function (lineResponse) {
                            return lineResponse.value !== null && lineResponse.path === "/telephony/" + billingAccount.key + "/line";
                        }).map("value").value();

                        billingAccount.value.fax = _.chain(response.fax).filter(function (faxResponse) {
                            return faxResponse.value !== null && faxResponse.path === "/telephony/" + billingAccount.key + "/fax";
                        }).map("value").value();

                    });
                } else if (billingAccounts.length === 1) {
                    // as there is no path attribute when there is only one billing account in batch
                    billingAccounts[0].value.numbers = _.chain(response.numbers).filter(function (numberResponse) {
                        return numberResponse.value !== null;
                    }).map("value").value();

                    billingAccounts[0].value.lines = _.chain(response.lines).filter(function (lineResponse) {
                        return lineResponse.value !== null;
                    }).map("value").value();

                    billingAccounts[0].value.fax = _.chain(response.fax).filter(function (faxResponse) {
                        return faxResponse.value !== null;
                    }).map("value").value();
                }

                return billingAccounts;
            });
        }

        return promise;
    }

    self.getGroup = function (billingAccount) {
        return self.initDeferred.promise.then(function () {
            var cached = self.groups[billingAccount];
            if (cached) {
                return $q.when(cached);
            }
            return self.fetchGroup(billingAccount);

        });
    };

    /** @TODO uncommend when API V7 available for /telephony */
    /*
        self.fetchGroup = function (billingAccount) {
            return Telephony.Erika().get().execute({
                billingAccount: billingAccount
            }).$promise.then(function (groupOptions) {
                return populateGroupOptions([{
                    value: groupOptions,
                    key: billingAccount
                }]).then(function (response) {
                    return addGroup(angular.extend(response[0].value, { billingAccount: billingAccount }));
                });
            });
        };
        */

    /** @TODO delete when API V7 available for /telephony */
    self.fetchGroup = function (billingAccount) {
        return Telephony.Lexi().get({
            billingAccount: billingAccount
        }).$promise.then(function (groupOptions) {
            return populateGroupOptions([{
                value: groupOptions,
                key: billingAccount
            }]).then(function (response) {
                return self.addGroup(angular.extend(response[0].value, { billingAccount: billingAccount }));
            });
        });
    };

    /**
         * Return populated groups from API, sorted by description, limits results from "offset" to "limit".
         * "searchQuery" parameter is optional and allow to only returns groups with description matching it.
         */
    /** @TODO uncommend when API V7 available for /telephony */
    /*
        self.fetchGroups = function (offset, limit, searchQuery) {
            var request = Telephony.Erika().query().expand().sort(["description"]).offset(offset).limit(limit);
            if (searchQuery) {
                request = request.addFilter("description", "like", "%" + searchQuery + "%");
            }
            return request.execute().$promise.then(function (billingAccounts) {
                return populateGroupOptions(billingAccounts);
            }).then(function (groups) {
                return _.map(groups, function (groupOption) {
                    return addGroup(angular.extend(groupOption.value, {
                        billingAccount: groupOption.key
                    }));
                });
            });
        };
        */

    /** @TODO delete when API V7 available for /telephony */
    self.fetchGroups = function (offset, limit) {
        return Telephony.Lexi().query().$promise.then(function (billingAccountsParam) {
            var billingAccounts = billingAccountsParam.slice(offset, offset + limit);
            var promises = _.map(billingAccounts, function (billingAccount) {
                return Telephony.Lexi().get({
                    billingAccount: billingAccount
                }).$promise;
            });
            return $q.allSettled(promises).then(function (result) {
                return result;
            }, function (result) {
                // filter errors - no need to reject
                // if a billing account is not well loaded, we don't block the sidebar.
                var groupNotFound = _.filter(result, function (res) {
                    return _.get(res, "status") === 404;
                });
                if (groupNotFound.length) {
                    return _.difference(result, groupNotFound);
                }
                return $q.reject(result);
            }).then(function (result) {
                return populateGroupOptions(_.map(result, function (account) {
                    return {
                        key: account.billingAccount,
                        value: account
                    };
                }));
            }).then(function (groups) {
                return _.compact(_.map(groups, function (groupOption) {
                    if (groupOption.value.status !== "closed") {
                        return self.addGroup(angular.extend(groupOption.value, {
                            billingAccount: groupOption.key
                        }));
                    }
                    return null;
                }));
            });
        });
    };

    self.resetAllCache = function () {
        // clear group cache ... double cache with lexi + mediator is soooo baaaaad :(
        self.groups = {};
        Telephony.Lexi().resetCache();
        Telephony.Lexi().resetQueryCache();
        Telephony.Line().Lexi().resetAllCache();

        // Telephony.Number().resetCache(); // number has currently no cache
        Telephony.Fax().Lexi().resetCache();
        Telephony.Fax().Lexi().resetQueryCache();
    };

    /* ----------  CURRENT GROUP  ----------*/

    self.setCurrentGroup = function (group) {
        currentGroup = group;
        return currentGroup;
    };

    self.getCurrentGroup = function () {
        return currentGroup;
    };

    /* -----  End of GROUP  ------*/

    /*= ======================================
        =            SIDEBAR HELPERS            =
        =======================================*/

    /* ----------  COUNT  ----------*/


    /** @TODO uncommend when API V7 available for /telephony */
    /*
        self.getCount = function () {
            return Telephony.Erika().query().execute().$promise.then(function (telephonyGroupsIds) {
                return telephonyGroupsIds.length;
            });
        };
        */

    /** @TODO delete when API V7 available for /telephony */
    self.getCount = function () {
        return Telephony.Lexi().query().$promise.then(function (telephonyGroupsIds) {
            return telephonyGroupsIds.length;
        });
    };

    /* -----  End of SIDEBAR HELPERS  ------*/

    /*= =====================================
        =            INITIALIZATION            =
        ======================================*/

    self.init = function (force) {
        if (self.initDeferred && !force) {
            return self.initDeferred.promise;
        }
        self.initDeferred = $q.defer();
        self.fetchGroups(0, 30).then(function (groups) { // @TODO fetch 50 groups when apiv7 available for /telepony
            self.initDeferred.resolve(groups);
        });
        return self.initDeferred.promise;
    };

    /* -----  End of INITIALIZATION  ------*/

});
