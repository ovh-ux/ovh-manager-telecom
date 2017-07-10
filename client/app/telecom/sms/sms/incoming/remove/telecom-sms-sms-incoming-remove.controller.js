angular.module("managerApp").controller("TelecomSmsSmsIncomingRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, incomingSms) {
    "use strict";

    var self = this;

    self.loading = {
        removeIncoming: false
    };

    self.removed = false;

    self.incomingSms = angular.copy(incomingSms);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeIncoming = true;

        return $q.all([
            Sms.Incoming().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: self.incomingSms.id
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeIncoming = false;
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
