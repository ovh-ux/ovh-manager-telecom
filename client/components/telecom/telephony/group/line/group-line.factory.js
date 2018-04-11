angular.module("managerApp").factory("TelephonyGroupLine", function ($q, $filter, OvhApiTelephony, OvhApiPackXdslVoipLine, VoipScheduler, VoipTimeCondition,
                                                                     TelephonyGroupLinePhone, TelephonyGroupLineClick2Call, TelephonyGroupLineOffer, VoipLineOldOffers) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupLine (optionsParam) {
        var options = optionsParam;

        if (!options) {
            options = {};
        }

        // options check
        if (!options.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupLine");
        }

        if (!options.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupLine");
        }

        // mandatory
        this.billingAccount = options.billingAccount;
        this.serviceName = options.serviceName;

        // from API
        this.serviceType = options.serviceType;
        this.description = options.description;

        this.infrastructure = options.infrastructure;
        this.offers = options.offers || [];
        this.getPublicOffer = options.getPublicOffer;
        this.simultaneousLines = options.simultaneousLines;
        this.phone = options.phone;
        this.hasPhone = undefined;
        this.hasSupportsPhonebook = undefined;

        this.options = null;
        this.ips = null;
        this.lastRegistrations = null;

        // Waiting API, next bill is always first day of next month
        this.nextBill = options.nextBill || moment([
            moment().year(),
            moment().month(),
            1]
        ).add(1, "M").valueOf();

        // managing notifications object
        this.notifications = options.notifications;
        if (_.isNull(_.get(this.notifications, "logs"))) {
            this.notifications.logs = {
                email: null,
                frequency: "Never",
                sendIfNull: false
            };
        }

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;

        this.offerInformations = null;
        this.pendingOfferChange = null;

        this.scheduler = null;
        this.timeCondition = null;

        this.availableCodecs = null;

        // helper
        this.isPlugNFax = _.some(this.offers, function (offer) {
            return angular.isString(offer) && (offer.indexOf("fax") >= 0 || _.some(VoipLineOldOffers.oldOffers.sipNFax, function (old) {
                return offer.indexOf(old) > -1;
            }));
        });
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupLine.prototype.getDisplayedName = function () {
        var self = this;

        return self.description || self.serviceName;
    };

    TelephonyGroupLine.prototype.getOffers = function (params) {
        return OvhApiTelephony.Line().Offers().v6().query(params).$promise;
    };

    TelephonyGroupLine.prototype.getOfferPhones = function (params) {
        return OvhApiTelephony.Line().Offers().v6().phones(params).$promise;
    };

    TelephonyGroupLine.prototype.getOfferTypes = function () {
        return _.map(this.offers, function (offer) {
            var cleaned = offer
                .replace(/^voip\.main\.offer\./, "")
                .split(".");
            return cleaned[0];
        });
    };

    TelephonyGroupLine.prototype.isOffer = function (name) {
        var offerPrefix = "voip.main.offer." + name;
        return _.some(this.offers, function (offer) {
            return _.startsWith(offer, offerPrefix);
        });
    };

    TelephonyGroupLine.prototype.isIndividual = function () {
        return this.isOffer("individual");
    };

    TelephonyGroupLine.prototype.isSipfax = function () {
        return this.isOffer("sipfax");
    };

    TelephonyGroupLine.prototype.isVoicefax = function () {
        return _.get(this, "getPublicOffer.name") === "voicefax" || this.isOffer("voicefax");
    };

    TelephonyGroupLine.prototype.isPriceplan = function () {
        return this.isOffer("priceplan");
    };

    TelephonyGroupLine.prototype.isTrunk = function () {
        return _.get(this, "getPublicOffer.name") === "trunk" || this.isOffer("trunk");
    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroupLine.prototype.save = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().edit({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            description: self.description,
            notifications: self.notifications
        }).$promise;
    };

    TelephonyGroupLine.prototype.supportsPhonebook = function () {
        var self = this;

        if (_.isUndefined(self.hasSupportsPhonebook)) {
            return OvhApiTelephony.Line().Phone().v6().supportsPhonebook({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }).$promise.then(function (support) {
                self.hasSupportsPhonebook = _.get(support, "data", null);
                return support;
            }, function () {
                self.hasSupportsPhonebook = false;
                return null;
            });
        }
        return $q.when(self.hasSupportsPhonebook);
    };

    TelephonyGroupLine.prototype.getPhone = function () {
        var self = this;

        if (!self.phone && _.isUndefined(self.hasPhone)) {
            return OvhApiTelephony.Line().Phone().v6().get({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }).$promise.then(function (phoneOpts) {
                self.phone = new TelephonyGroupLinePhone({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName
                }, phoneOpts);

                self.hasPhone = true;

                return self.phone;
            }, function () {
                self.hasPhone = false;
                return null;
            });
        }
        return $q.when(self.phone);

    };

    TelephonyGroupLine.prototype.getClick2Call = function () {
        var self = this;

        self.click2Call = new TelephonyGroupLineClick2Call({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        });

        return self.click2Call;
    };

    TelephonyGroupLine.prototype.getAvailableTerminationReasons = function () {
        return OvhApiTelephony.Line().v6().schema().$promise.then(function (schema) {
            return schema;
        });
    };

    TelephonyGroupLine.prototype.hasPendingOfferTasks = function () {
        var self = this;

        return OvhApiTelephony.Service().OfferTask().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (taskIds) {
            return $q.all(_.map(taskIds, function (id) {
                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    taskId: id
                }).$promise;
            }));
        }).then(function (tasks) {
            return _.filter(tasks, function (task) {
                return task.status === "todo" || task.status === "doing" || task.status === "pause";
            }).length > 0;
        });
    };

    TelephonyGroupLine.prototype.getTerminating = function () {
        var self = this;

        return OvhApiTelephony.Service().OfferTask().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            action: "termination",
            status: "todo"
        }).$promise.then(function (tasks) {
            if (tasks[0]) {
                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    action: "termination",
                    status: "todo",
                    taskId: tasks[0]
                }).$promise.then(function (taskDetails) {
                    taskDetails.executionDate = $filter("date")(taskDetails.executionDate, "shortDate");
                    return taskDetails;
                });
            }
            return null;
        });
    };

    // Get convert line to alias task
    TelephonyGroupLine.prototype.getConvertionTask = function () {
        var self = this;

        return OvhApiTelephony.Service().OfferTask().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            action: "convertToAlias",
            status: "todo"
        }).$promise.then(function (tasks) {
            if (tasks[0]) {
                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    action: "convertToAlias",
                    status: "todo",
                    taskId: tasks[0]
                }).$promise;
            }
            return null;
        });
    };

    /* Terminate/Resiliate Service */
    TelephonyGroupLine.prototype.terminate = function (options) {
        var self = this;
        var params = {
            reason: options.id
        };

        if (options.details) {
            params.details = options.details;
        }
        return OvhApiTelephony.Line().v6().terminate({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, params).$promise;
    };

    /* Cancel an Termination service */
    TelephonyGroupLine.prototype.cancelTermination = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().cancelTermination({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise;
    };

    TelephonyGroupLine.prototype.isIncludedInXdslPack = function () {
        var self = this;

        return OvhApiPackXdslVoipLine.v7().services().aggregate("packName").execute().$promise.then(function (lines) {
            return _.some(lines, { key: self.serviceName });
        });
    };

    /* ----------  OPTIONS  ----------*/

    TelephonyGroupLine.prototype.getOptions = function () {
        var self = this;

        if (!self.options) {
            return OvhApiTelephony.Line().Options().v6().get({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }).$promise.then(function (lineOptions) {
                self.options = lineOptions;

                // if no codecs options - get the default
                if (self.options && !self.options.codecs) {
                    return OvhApiTelephony.Line().Options().v6().defaultCodecs({
                        billingAccount: self.billingAccount,
                        serviceName: self.serviceName
                    }).$promise.then(function (defaultCodecs) {
                        self.options.codecs = defaultCodecs.codecs;
                        return self.options;
                    });
                }
                return self.options;

            });
        }
        return $q.when(self.options);

    };

    TelephonyGroupLine.prototype.saveOption = function (optionName, optionValue) {
        var self = this;
        var lineOptions = {};

        lineOptions[optionName] = optionValue;

        return OvhApiTelephony.Line().Options().v6().update({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, lineOptions).$promise.then(function () {
            self.options[optionName] = optionValue;
        });
    };

    /* ----------  CODECS  ----------*/

    TelephonyGroupLine.prototype.getAvailableCodecs = function () {
        var self = this;

        return OvhApiTelephony.Line().Options().v6().availableCodecs({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (codecsList) {
            self.availableCodecs = _.chain(codecsList).map(function (codec) {
                if (!_.endsWith(codec, "_a")) {
                    return {
                        value: codec,
                        automatic: _.indexOf(codecsList, codec + "_a") > -1
                    };
                }
                return null;

            }).sortBy(function (codec) {
                return (codec && codec.value.length) || -1;
            }).value();

            // remove null items (codecs that finish with _a)
            _.remove(self.availableCodecs, function (codec) {
                return _.isNull(codec);
            });

            return self.availableCodecs;
        });
    };

    /* ----------  IPS  ----------*/

    TelephonyGroupLine.prototype.getIps = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().ips({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (ips) {
            self.ips = ips;
            return self.ips;
        });
    };

    /* ----------  LAST REGISTRATIONS  ----------*/

    TelephonyGroupLine.prototype.getLastRegistrations = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().lastRegistrations({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (lastRegistrations) {
            self.lastRegistrations = lastRegistrations;
            return self.lastRegistrations;
        });
    };

    /* ----------  OFFER  ----------*/

    /**
     *  Get the current offer information. Call GET /telephony/{billingAccount}/line/{serviceName}/offer API.
     *
     *  @return {Promise} That return an Object representing the current offer informations.
     */
    TelephonyGroupLine.prototype.getCurrentOfferInformations = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().offer({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (infos) {
            self.offerInformations = new TelephonyGroupLineOffer(angular.extend(infos, {
                details: self.offers
            }));

            return infos;
        });
    };

    /**
     *  Get available offers for a offerChange operation. Call GET /telephony/{billingAccount}/service/{serviceName}/offerChanges API.
     *
     *  @return {Promise} That return an Array of Object representing offers.
     */
    TelephonyGroupLine.prototype.getAvailableOffers = function () {
        var self = this;

        return OvhApiTelephony.Service().v6().offerChanges({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (offers) {
            return _.map(offers, function (offer) {
                return new TelephonyGroupLineOffer(offer);
            });
        });
    };

    /**
     *  Call POST /telephony/{billingAccount}/service/{serviceName}/offerChange API that run a offerChange.
     *
     *  @param  {Object} newOffer The new offer to change for. This is an object returned by GET /telephony/{billingAccount}/service/{serviceName}/offerChanges API.
     *  @param  {String} newOffer.name The name of the offer.
     *  @param  {String} newOffer.description The description of the offer.
     *
     *  @return {Promise} That return the current instance of line.
     */
    TelephonyGroupLine.prototype.changeOffer = function (newOffer) {
        var self = this;

        return OvhApiTelephony.Service().v6().changeOffer({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            offer: newOffer.name
        }).$promise.then(function () {
            self.pendingOfferChange = newOffer;
            return self;
        });
    };

    /**
     *  Check if an offerChange operation is doing. Call GET /telephony/{billingAccount}/service/{serviceName}/offerChange API.
     *
     *  @return {Promise} That return an object representing the new offer.
     */
    TelephonyGroupLine.prototype.getOfferChange = function () {
        var self = this;

        return OvhApiTelephony.Service().v6().offerChange({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (offer) {
            return self.getAvailableOffers().then(function (availableOffers) {
                self.pendingOfferChange = _.find(availableOffers, {
                    name: offer.offer
                }) || null; // if null is returned, it means there is a problem with API... :-D

                return self.pendingOfferChange;
            });
        }, function (error) {
            if (error.status === 404) {
                return null;
            }
            return $q.reject(error);

        });
    };

    /**
     *  Cancel an offerChange process. Call DELETE /telephony/{billingAccount}/service/{serviceName}/offerChange API.
     *
     *  @return {Promise} That return current instance of GroupLine.
     */
    TelephonyGroupLine.prototype.cancelOfferChange = function () {
        var self = this;

        return OvhApiTelephony.Service().v6().cancelOfferChange({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function () {
            self.pendingOfferChange = null;
            return self;
        });
    };

    /* ----------  SIP DOMAIN  ----------*/

    TelephonyGroupLine.prototype.getAvailableSipDomains = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().sipDomains({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (availableDomains) {
            return availableDomains;
        });
    };

    /* ----------  SCHEDULER  ----------*/

    TelephonyGroupLine.prototype.getScheduler = function () {
        var self = this;

        if (!self.scheduler) {
            self.scheduler = new VoipScheduler({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            });
        }

        return self.scheduler.get();
    };

    /* ----------  TIME CONDITION  ----------*/

    TelephonyGroupLine.prototype.getTimeCondition = function () {
        var self = this;

        if (!self.timeCondition) {
            self.timeCondition = new VoipTimeCondition({
                featureType: "sip",
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            });
        }

        return self.timeCondition.init();
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupLine.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            description: angular.copy(self.description),
            notifications: angular.copy(self.notifications),
            options: angular.copy(self.options)
        };

        return self;
    };

    TelephonyGroupLine.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.description = angular.copy(self.saveForEdition.description);
            self.notifications = angular.copy(self.saveForEdition.notifications);
            self.options = angular.copy(self.saveForEdition.options);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupLine.prototype.hasChange = function (path) {
        var self = this;

        return _.get(self.saveForEdition, path) !== _.get(self, path);
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupLine;

});
