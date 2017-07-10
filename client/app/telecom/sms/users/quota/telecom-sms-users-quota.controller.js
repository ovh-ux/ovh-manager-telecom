angular.module("managerApp").controller("TelecomSmsUsersQuotaCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, user, service) {
    "use strict";

    var self = this;

    self.loading = {
        quotaUser: false
    };

    self.quotaApplied = false;

    self.user = angular.copy(user);
    self.service = angular.copy(service);

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return !(
            self.user.quotaInformations.quotaLeft === user.quotaInformations.quotaLeft &&
            self.user.quotaInformations.quotaStatus === user.quotaInformations.quotaStatus
        );
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.quota = function () {
        self.loading.quotaUser = true;

        return $q.all([
            Sms.Users().Lexi().edit({
                serviceName: $stateParams.serviceName,
                login: self.user.login
            }, {
                quotaInformations: {
                    quotaLeft: self.user.quotaInformations.quotaLeft,
                    quotaStatus: self.user.quotaInformations.quotaStatus
                }
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.quotaUser = false;
            self.quotaApplied = true;

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
