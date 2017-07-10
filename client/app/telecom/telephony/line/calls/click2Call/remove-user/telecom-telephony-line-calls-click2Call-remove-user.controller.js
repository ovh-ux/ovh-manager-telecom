angular.module("managerApp").controller("TelecomTelephonyLineClick2CallRemoveUserCtrl", function ($uibModalInstance, $q, $timeout, TelephonyGroupLineClick2CallUser, line, user) {
    "use strict";

    var self = this;

    self.loading = {
        removeUser: false
    };

    self.removed = false;

    self.userToDelete = new TelephonyGroupLineClick2CallUser({
        billingAccount: line.billingAccount,
        serviceName: line.serviceName
    }, {
        login: user.login,
        id: user.id
    });

    self.remove = function () {
        self.loading.removeUser = true;

        return $q.all([
            self.userToDelete.remove().then(function () {
                return true;
            }),
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
});
