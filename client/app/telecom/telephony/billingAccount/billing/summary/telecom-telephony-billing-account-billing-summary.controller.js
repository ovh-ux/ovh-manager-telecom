angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingSummaryCtrl", function ($q, $filter, $window, $timeout, $stateParams, $translate, TelephonyMediator, OvhApiTelephony, Toast) {
    "use strict";

    const self = this;

    self.group = null;
    self.consumptionSummary = null;
    self.consumptionDetails = {
        raw: null
    };

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchConsumption () {
        return OvhApiTelephony.Service().VoiceConsumption().Aapi().get({
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
        });
    }

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    this.$onInit = function () {
        return TelephonyMediator.getGroup($stateParams.billingAccount)
            .then(function (group) {
                self.group = group;
                return self.group;
            })
            .then(fetchConsumption)
            .catch(function (error) {
                Toast.error([$translate.instant("telephony_group_billing_summary_consumptioninit_error"), (error.data && error.data.message) || ""].join(" "));
                return $q.reject(error);
            });
    };
});
