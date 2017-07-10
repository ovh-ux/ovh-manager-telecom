angular.module("managerApp").controller("TelecomSmsSendersRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, sender) {
    "use strict";

    var self = this;

    self.loading = {
        removeSender: false
    };

    self.removed = false;

    self.sender = angular.copy(sender);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeSender = true;

        return $q.all([
            Sms.Senders().Lexi().delete({
                serviceName: $stateParams.serviceName,
                sender: self.sender.sender
            }).$promise.then(function (voidResponse) {
                return voidResponse;
            }, function (error) {
                return $q.reject(error);
            }),
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeSender = false;
            self.removed = true;

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

    /* -----  End of ACTIONS  ------*/
});
