angular.module("managerApp").controller("TelecomSmsOptionsManageUpdateCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, service) {
    "use strict";

    var self = this;

    self.loading = {
        updateOptions: false
    };

    self.updated = false;

    self.service = angular.copy(service);

    self.urlPattern = /^(https?):\/\/.*$/;

    self.hasChanged = function () {
        return !(
            self.service.callBack === service.callBack &&
            self.service.stopCallBack === service.stopCallBack
        );
    };

    self.setUrls = function () {
        self.loading.updateOptions = true;

        return $q.all([
            Sms.Lexi().put({
                serviceName: $stateParams.serviceName
            }, {
                callBack: self.service.callBack,
                stopCallBack: self.service.stopCallBack
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.updateOptions = false;
            self.updated = true;

            service.callBack = self.service.callBack;
            service.stopCallBack = self.service.stopCallBack;

            return $timeout(self.close, 1500);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };
});
