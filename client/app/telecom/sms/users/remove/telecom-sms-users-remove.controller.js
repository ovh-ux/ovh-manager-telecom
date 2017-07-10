angular.module("managerApp").controller("TelecomSmsUsersRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, user) {
    "use strict";

    var self = this;

    self.loading = {
        removeUser: false
    };

    self.removed = false;

    self.user = angular.copy(user);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeUser = true;

        return $q.all([
            Sms.Users().Lexi().delete({
                serviceName: $stateParams.serviceName,
                login: self.user.login
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeUser = false;
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
