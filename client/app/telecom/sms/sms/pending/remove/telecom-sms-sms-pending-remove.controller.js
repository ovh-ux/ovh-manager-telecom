angular.module("managerApp").controller("TelecomSmsSmsPendingRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, pendingSms) {
    "use strict";

    var self = this;

    self.loading = {
        removePending: false
    };

    self.removed = false;

    self.pendingSms = angular.copy(pendingSms);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removePending = true;

        return $q.all([
            Sms.Jobs().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: self.pendingSms.id
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removePending = false;
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
