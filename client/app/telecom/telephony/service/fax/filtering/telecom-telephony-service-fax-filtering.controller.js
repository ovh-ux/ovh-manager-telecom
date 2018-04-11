angular.module("managerApp").controller("TelecomTelephonyServiceFaxFilteringCtrl", function ($filter, $q, $stateParams, $timeout, $translate, TelephonyMediator, OvhApiTelephony, Toast, telephonyBulk) {
    "use strict";

    var self = this;
    var faxSettings = null;
    var screenListsTypes = [
        "whitelistedNumbers", "whitelistedTSI",
        "blacklistedNumbers", "blacklistedTSI"
    ];

    /* ===============================
    =            HELPERS            =
    =============================== */

    function clearCache () {
        OvhApiTelephony.Fax().v6().resetCache();
        OvhApiTelephony.Fax().v6().resetQueryCache();
    }

    function fetchScreenLists () {
        return OvhApiTelephony.Fax().v6().getScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (screenLists) {
            self.screenListsForm.filteringList = screenLists.filteringList;
            return _.map(screenListsTypes, function (type) {
                return _.map(_.get(screenLists, type), function (screen) {
                    return {
                        callNumber: screenLists.callNumber,
                        number: screen,
                        type: type,
                        id: _.random(_.now())
                    };
                });
            });
        }).then(function (screenLists) {
            return _.flatten(screenLists);
        });
    }

    function fetchSettings () {
        clearCache();
        return OvhApiTelephony.Fax().v6().getSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    self.getSelection = function () {
        return _.filter(self.screenLists.raw, function (screen) {
            return screen && self.screenLists.selected && self.screenLists.selected[screen.id];
        });
    };

    /* -----  End of HELPERS  ------ */

    /* ===============================
    =            ACTIONS            =
    =============================== */

    self.updateFilteringList = function () {
        self.screenListsForm.isUpdating = true;
        return OvhApiTelephony.Fax().v6().createScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, _.pick(self.screenListsForm, "filteringList")).$promise.catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_filtering_list_update_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.screenListsForm.isUpdating = false;
        });
    };

    self.updateAnonymousRejection = function () {
        self.screenListsForm.isUpdating = true;
        var param = _.pick(faxSettings, ["faxMaxCall", "faxQuality", "faxTagLine", "fromEmail", "fromName", "mailFormat", "redirectionEmail"]);
        param.rejectAnonymous = self.rejectAnonymous;
        return OvhApiTelephony.Fax().v6().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, param).$promise.then(function () {
            return fetchSettings();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_service_fax_filtering_anonymous_rejection_update_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.screenListsForm.isUpdating = false;
        });
    };

    self.addScreen = function (form) {
        var screenList = {};
        var screenListType = [
            self.screenListToAdd.nature,
            self.screenListToAdd.type
        ].join("");
        screenList[screenListType] = [].concat(self.screenListToAdd.number);
        self.screenListsForm.isAdding = true;
        return OvhApiTelephony.Fax().v6().createScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, screenList).$promise.then(function () {
            form.$setPristine();
            self.screenListToAdd.number = "";
            Toast.success($translate.instant("telephony_service_fax_filtering_new_success"));
            return self.refresh();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_service_fax_filtering_new_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.screenListsForm.isAdding = false;
        });
    };

    self.exportSelection = function () {
        return _.map(self.getSelection(), function (filter) {
            return _.pick(filter, ["callNumber", "number", "type"]);
        });
    };

    self.removeSelectedScreenLists = function () {
        var queries = $q.reject({ statusText: "Unable to remove selected screenLists" });
        var screenLists = self.getSelection();
        var listQuery = {};

        screenListsTypes.forEach(function (type) {
            var rawOfType = _.pluck(_.filter(self.screenLists.raw, { type: type }), "number");
            var selectedOfType = _.pluck(_.filter(screenLists, { type: type }), "number");
            listQuery[type] = _.difference(rawOfType, selectedOfType);
        });

        if (_.size(listQuery)) {
            queries = {
                update: OvhApiTelephony.Fax().v6().updateScreenLists({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, listQuery).$promise,
                noop: $timeout(angular.noop, 500)
            };
        }
        self.screenLists.isDeleting = true;
        Toast.info($translate.instant("telephony_service_fax_filtering_table_delete_success"));
        return $q.all(queries).then(function () {
            return self.refresh();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_filtering_table_delete_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.screenLists.isDeleting = false;
        });
    };

    self.sortScreenLists = function () {
        var data = angular.copy(self.screenLists.raw);
        data = $filter("filter")(data, self.screenLists.filterBy);
        data = $filter("orderBy")(
            data,
            self.screenLists.orderBy,
            self.screenLists.orderDesc
        );
        self.screenLists.sorted = data;

        // avoid pagination bug...
        if (self.screenLists.sorted.length === 0) {
            self.screenLists.paginated = [];
        }
    };

    self.orderScreenListsBy = function (by) {
        if (self.screenLists.orderBy === by) {
            self.screenLists.orderDesc = !self.screenLists.orderDesc;
        } else {
            self.screenLists.orderBy = by;
        }
        self.sortScreenLists();
    };

    self.refresh = function () {
        self.screenLists.isLoading = true;
        return fetchScreenLists().then(function (screenLists) {
            self.screenLists.raw = screenLists;
            self.sortScreenLists();

            return fetchSettings().then(function (settings) {
                faxSettings = settings;
                self.rejectAnonymous = faxSettings.rejectAnonymous;
                return settings;
            }).catch(function (err) {
                return $q.reject(err);
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_service_fax_filtering_fetch_lists_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.screenLists.isLoading = false;
        });
    };

    /* -----  End of ACTIONS  ------ */

    /* ======================================
    =            INITIALIZATION            =
    ====================================== */

    function init () {
        self.loading = {
            init: false
        };
        self.fax = null;
        self.screenLists = {
            raw: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "number",
            orderDesc: false,
            filterBy: {
                type: undefined
            },
            isLoading: false,
            isDeleting: false
        };
        self.screenListsForm = {
            filteringList: null,
            isAdding: false,
            isUpdating: false
        };
        self.screenListToAdd = {
            nature: "whitelisted",
            type: "Numbers",
            number: null
        };
        self.settings = null;
        self.loading.init = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            return self.refresh();
        }).catch(function (err) {
            Toast.error([$translate.instant("an_error_occured"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------ */

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "faxFiltering",
            actions: [{
                name: "faxScreenLists",
                route: "/telephony/{billingAccount}/fax/{serviceName}/screenLists",
                method: "POST",
                params: null
            }, {
                name: "settings",
                route: "/telephony/{billingAccount}/fax/{serviceName}/settings",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["fax", "voicefax"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function (action) {
        switch (action) {
        case "faxScreenLists":
            return _.pick(self.screenListsForm, "filteringList");
        case "settings":
            var param = _.pick(faxSettings, ["faxMaxCall", "faxQuality", "faxTagLine", "fromEmail", "fromName", "mailFormat", "redirectionEmail"]);
            param.rejectAnonymous = self.rejectAnonymous;
            return param;
        default:
            return false;
        }
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_service_fax_filtering_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_service_fax_filtering_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_service_fax_filtering_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        self.refresh();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_service_fax_filtering_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
