angular.module("managerApp").controller("TelecomTelephonyAliasSvaGeneratorCtrl", function ($stateParams, OvhApiTelephony, ToastError, SvaGeneratorConfig) {
    "use strict";

    var self = this;

    function init () {

        self.serviceName = $stateParams.serviceName;
        self.fillTypeList = SvaGeneratorConfig.fillType;
        self.fillType = self.fillTypeList[0];
        self.numberFormatList = SvaGeneratorConfig.numberFormat;
        self.numberFormat = self.numberFormatList[0];
        self.pricePerCall = 0;
        self.pricePerMinute = 0;
        self.notSupported = false;

        self.isLoading = true;
        OvhApiTelephony.Rsva().v6().getCurrentRateCode({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (rate) {
            self.rate = rate;
            self.pricePerCall = rate.pricePerCallWithoutTax.value * SvaGeneratorConfig.taxCoefficient;
            self.pricePerMinute = rate.pricePerMinuteWithoutTax.value * SvaGeneratorConfig.taxCoefficient;
        }).catch(function (err) {
            if (err && err.status === 404) {
                self.notSupported = true;
            } else {
                ToastError(err);
            }
        }).finally(function () {
            self.isLoading = false;
        });
    }

    init();
});
