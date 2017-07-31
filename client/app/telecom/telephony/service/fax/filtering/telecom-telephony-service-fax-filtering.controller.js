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

    function fetchOptions () {
        return $q.when({
            anonymousFaxRejection: false
        });
    }

    function fetchScreenLists () {
        return Telephony.Fax().Lexi().getScreenLists({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (screenLists) {
            return _.map(screenListsTypes, function (type) {
                return _.map(_.get(screenLists, type), function (screen) {
                    return {
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
    =            EVENTS             =
    =============================== */

    self.changeOption = function (opt) {
        return opt;
    };

    /* -----  End of EVENTS  ------ */

    /* ===============================
    =            ACTIONS            =
    =============================== */

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
            options: fetchOptions(),
            screenLists: fetchScreenLists()
        }).then(function (result) {
            self.options.raw = result.options;
            self.options.modified = angular.copy(result.options);
            self.screenLists.raw = result.screenLists;
            self.sortScreenLists();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.screenLists.isLoading = false;
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

    /* -----  End of ACTIONS  ------ */

    /* ======================================
    =            INITIALIZATION            =
    ====================================== */

    function init () {
        self.loading = {
            init: false
        };
        self.fax = null;
        self.options = {
            raw: null,
            modified: null,
            isUpdating: null
        };
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
