angular.module("managerApp").controller("TelecomSmsUsersCallbackCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, user) {
    "use strict";

    var self = this;

    self.loading = {
        changePasswordUser: false
    };

    self.changed = false;

    self.user = angular.copy(user);

    self.urlPattern = /^(https?):\/\/.*$/;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return self.user.callBack === user.callBack;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setUrl = function () {
        self.loading.changePasswordUser = true;

        return $q.all([
            Sms.Users().Lexi().edit({
                serviceName: $stateParams.serviceName,
                login: self.user.login
            }, {
                callBack: self.user.callBack
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.changePasswordUser = false;
            self.changed = true;

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
