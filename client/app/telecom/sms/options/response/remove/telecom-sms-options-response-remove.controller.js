angular.module("managerApp").controller("TelecomSmsOptionsResponseRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, service, index, option) {
    "use strict";

    var self = this;

    self.loading = {
        removeTrackingOption: false
    };

    self.removed = false;

    self.service = angular.copy(service);
    self.index = index;
    self.option = option;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeTrackingOption = true;

        _.remove(
            self.service.smsResponse.trackingOptions,
            self.service.smsResponse.trackingOptions[self.index]
        );

        return $q.all([
            Sms.Lexi().edit({
                serviceName: $stateParams.serviceName
            }, {
                smsResponse: {
                    trackingOptions: self.service.smsResponse.trackingOptions,
                    responseType: self.service.smsResponse.responseType
                }
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeTrackingOption = false;
            self.removed = true;

            return $timeout(self.close, 1000);
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

    /* -----  End of ACTIONS  ------*/
});
