angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingSummaryCtrl", function ($q, $filter, $window, $timeout, $stateParams, $translate, TelephonyMediator, Telephony, Toast) {
    "use strict";

    var self = this;

    self.group = null;

    self.loading = {
        init: false
    };

    self.consumptionSummary = null;
    self.consumptionDetails = {
        raw: null,
        paginated: null,
        sorted: null,
        orderBy: "",
        orderDesc: true
    };

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchConsumption () {
        return Telephony.Service().VoiceConsumption().Aapi().get({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (consumption) {

            _.forEach(["lines", "numbers", "fax"], function (serviceType) {
                _.forEach(self.group[serviceType], function (service) {
                    _.forEach(consumption.details, function (s, idx) {
                        if (s.service === service.serviceName) {
                            consumption.details[idx].description = service.description;
                            consumption.details[idx].type = serviceType;
                        }
                    });
                });
            });

            self.consumptionDetails.raw = consumption.details;
            self.consumptionSummary = consumption.summary;

            self.sortConsumption();
        });
    }

    self.sortConsumption = function () {
        self.consumptionDetails.sorted = $filter("orderBy")(
            self.consumptionDetails.raw,
            self.consumptionDetails.orderBy,
            self.consumptionDetails.orderDesc
        );
    };

    self.orderBy = function (by) {
        if (self.consumptionDetails.orderBy === by) {
            self.consumptionDetails.orderDesc = !self.consumptionDetails.orderDesc;
        } else {
            self.consumptionDetails.orderBy = by;
        }
        self.sortConsumption();
    };

    /* -----  End of HELPERS  ------*/


    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount)
            .then(function (group) {
                self.group = group;
                return self.group;
            })
            .then(fetchConsumption)
            .catch(function (error) {
                Toast.error([$translate.instant("telephony_group_billing_summary_consumptioninit_error"), (error.data && error.data.message) || ""].join(" "));
                return $q.reject(error);
            })
            .finally(function () {
                self.loading.init = false;
            });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
