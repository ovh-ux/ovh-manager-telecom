angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingTollfreeHistoryCtrl", function ($q, $filter, $window, $timeout, $stateParams, $translate, TelephonyMediator, Telephony, Toast) {
    "use strict";

    var self = this;

    self.group = null;

    self.loading = {
        init: false
    };

    self.consumption = {
        raw: null,
        paginated: null,
        sorted: null,
        orderBy: "date",
        orderDesc: true
    };

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchHistory () {
        return Telephony.HistoryTollfreeConsumption().Lexi().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (dates) {
            return $q.all(_.map(_.chunk(dates, 50), function (chunkDates) {
                return Telephony.HistoryTollfreeConsumption().Lexi().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    date: chunkDates
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.each(result, function (consumption) {
                    consumption.priceValue = consumption.price ? consumption.price.value : null;
                });
            });
        });
    }

    self.sortConsumption = function () {
        self.consumption.sorted = $filter("orderBy")(
            self.consumption.raw,
            self.consumption.orderBy,
            self.consumption.orderDesc
        );
    };

    self.orderBy = function (by) {
        if (self.consumption.orderBy === by) {
            self.consumption.orderDesc = !self.consumption.orderDesc;
        } else {
            self.consumption.orderBy = by;
        }
        self.sortConsumption();
    };

    self.fetchFile = function (consumption) {
        var tryDownload = function () {
            return Telephony.HistoryTollfreeConsumption().Lexi().getDocument({
                billingAccount: $stateParams.billingAccount,
                date: consumption.date
            }).$promise.then(function (info) {
                if (info.status === "error") {
                    return $q.reject({
                        statusText: "Unable to download message"
                    });
                } else if (info.status === "done") {
                    return $q.when(info);
                }

                // file is not ready to download, just retry
                return $timeout(tryDownload, 1000);
            });
        };
        return tryDownload();
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.download = function (consumption) {
        consumption.downloading = true;

        return self.fetchFile(consumption).then(function (info) {
            $window.location.href = info.url;
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_group_billing_tollfree_history_download_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            consumption.downloading = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;

            return fetchHistory().then(function (consumptions) {
                self.consumption.raw = consumptions;
                self.sortConsumption();
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_group_billing_tollfree_history_init_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
