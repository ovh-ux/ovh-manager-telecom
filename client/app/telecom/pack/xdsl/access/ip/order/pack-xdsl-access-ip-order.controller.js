angular.module("managerApp").controller("XdslAccessIpOrderCtrl", ["$uibModalInstance", "data", "XdslIps", "ToastError", "URLS", function ($uibModalInstance, data, XdslIps, ToastError, URLS) {
    "use strict";

    var self = this;
    var ipRange = 29;

    this.constants = {
        xdslId: data.xdslId,
        price: "",
        amountIpOrdered: 8,
        contractUrl: URLS.ipOrderContract,
        hoursBeforeActivation: 1,
        hoursBeforeCollected: 48,
        engagementMinimumMonths: 1
    };

    this.checkbox = {
        userAcceptImmediateExecution: false,
        userAcceptModalities: false
    };

    this.init = function () {
        self.loading = true;
        XdslIps.Lexi().price({
            ipRange: ipRange
        }, null).$promise.then(function (result) {
            self.constants.price = result.text;
        }, function (err) {
            ToastError(err);
            $uibModalInstance.dismiss("error");
        }).finally(function () {
            self.loading = false;
        });
    };

    this.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    this.confirm = function () {
        self.loading = true;
        XdslIps.Lexi().order({
            xdslId: self.constants.xdslId
        }, null).$promise.then(function (result) {
            $uibModalInstance.close(result);
        }, ToastError).finally(function () {
            self.loading = false;
        });
    };

    this.init();
}]);
