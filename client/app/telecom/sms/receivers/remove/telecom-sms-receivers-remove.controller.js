angular.module("managerApp").controller("TelecomSmsReceiversRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, receiver) {
    "use strict";

    var self = this;

    self.loading = {
        removeReceiver: false
    };

    self.removed = false;

    self.receiver = angular.copy(receiver);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeReceiver = true;

        return $q.all([
            Sms.Receivers().Lexi().delete({
                serviceName: $stateParams.serviceName,
                slotId: self.receiver.slotId
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeReceiver = false;
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
