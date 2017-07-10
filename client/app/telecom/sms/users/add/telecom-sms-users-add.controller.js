angular.module("managerApp").controller("TelecomSmsUsersAddCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms) {
    "use strict";

    var self = this;

    self.loading = {
        addUser: false
    };

    self.added = false;

    self.user = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.add = function () {
        self.loading.addUser = true;

        return $q.all([
            Sms.Users().Lexi().create({
                serviceName: $stateParams.serviceName
            }, {
                login: self.user.login,
                password: self.user.password
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.addUser = false;
            self.added = true;

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
