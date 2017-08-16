angular.module("managerApp").controller("TelecomTelephonyServiceFaxFilteringCtrl", function ($filter, $q, $stateParams, $timeout, $translate, TelephonyMediator, Telephony, ToastError, Toast) {
    "use strict";

    var self = this;

    var screenListsTypes = [
        "whitelistedNumbers", "whitelistedTSI",
        "blacklistedNumbers", "blacklistedTSI"
    ];

    /* ===============================
    =            HELPERS            =
    =============================== */

    function fetchEnums () {
        return Telephony.Lexi().schema({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (schema) {
            return {
                screenListType: schema.models["telephony.FaxScreenListTypeEnum"].enum
            };
        });
    }

    function fetchScreenLists () {
        return Telephony.Fax().Lexi().getScreenLists({
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
        return Telephony.Fax().Lexi().createScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, _.pick(self.screenListsForm, "filteringList")).$promise.catch(function (err) {
            return new ToastError(err);
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
        return Telephony.Fax().Lexi().createScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, screenList).$promise.then(function () {
            form.$setPristine();
            self.screenListToAdd.number = "";
            Toast.success($translate.instant("telephony_service_fax_filtering_new_success"));
            return self.refresh();
        }).catch(function (error) {
            return new ToastError(error);
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
                update: Telephony.Fax().Lexi().updateScreenLists({
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
            return new ToastError(err);
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
        return $q.all({
            enums: fetchEnums(),
            screenLists: fetchScreenLists()
        }).then(function (result) {
            self.enums = result.enums;
            self.screenLists.raw = result.screenLists;
            self.sortScreenLists();
        }).catch(function (err) {
            return new ToastError(err);
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
        self.enums = {};
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
        self.loading.init = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------ */

    init();
});
