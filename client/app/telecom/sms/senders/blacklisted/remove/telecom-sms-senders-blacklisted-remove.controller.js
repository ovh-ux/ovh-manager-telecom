angular.module("managerApp").controller("TelecomSmsSendersBlacklistedRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, blacklist) {
    "use strict";

    var self = this;

    self.loading = {
        removeBlacklisted: false
    };

    self.removed = false;

    self.blacklist = angular.copy(blacklist);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeBlacklisted = true;

        return $q.all([
            Sms.Blacklists().Lexi().delete({
                serviceName: $stateParams.serviceName,
                number: self.blacklist.number
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeBlacklisted = false;
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
