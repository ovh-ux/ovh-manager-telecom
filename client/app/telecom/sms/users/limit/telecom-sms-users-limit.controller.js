angular.module("managerApp").controller("TelecomSmsUsersLimitCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, User, Sms, SmsMediator, user, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchEnums () {
        return SmsMediator.getApiScheme().then(function (schema) {
            return {
                smsSupport: schema.models["sms.SupportEnum"].enum
            };
        });
    }

    function fetchUserEmail () {
        if (_.isEmpty(user.alertThresholdInformations.alertEmail)) {
            return User.Lexi().get().$promise.then(function (userResult) {
                self.user.alertThresholdInformations.alertEmail = userResult.email;
            });
        }
        return $q.when(null);
    }

    self.hasChanged = function () {
        return !(
            self.user.alertThresholdInformations.alertEmail === user.alertThresholdInformations.alertEmail &&
            self.user.alertThresholdInformations.alertNumber === user.alertThresholdInformations.alertNumber &&
            self.alertThreshold === user.alertThresholdInformations.alertThreshold &&
            self.user.alertThresholdInformations.support === user.alertThresholdInformations.support &&
            self.user.alertThresholdInformations.limitStatus === self.limitStatus
        );
    };

    function getLimitStatus () {
        if (self.user.alertThresholdInformations.alertThreshold === -1) {
            self.user.alertThresholdInformations.limitStatus = "inactive";
        } else {
            self.user.alertThresholdInformations.limitStatus = "active";
            self.alertThreshold = self.user.alertThresholdInformations.alertThreshold;
        }
        return self.user.alertThresholdInformations.limitStatus;
    }

    function getAlertThresholdInformations () {
        return {
            alertThresholdInformations: {
                alertEmail: self.user.alertThresholdInformations.alertEmail,
                alertNumber: self.user.alertThresholdInformations.alertNumber,
                alertThreshold: self.user.alertThresholdInformations.limitStatus === "active" ? self.alertThreshold : -1,
                support: self.user.alertThresholdInformations.support
            }
        };
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.limit = function () {
        self.loading.limitUser = true;

        return $q.all([
            Sms.Users().Lexi().edit({
                serviceName: $stateParams.serviceName,
                login: self.user.login
            }, getAlertThresholdInformations()).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.limitUser = false;
            self.limited = true;

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

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            limitUser: false
        };

        self.limited = false;

        self.user = angular.copy(user);

        self.enums = {};

        self.limitStatus = null;
        self.numberPattern = /^\+?\d+$/;

        self.loading.init = true;
        return $q.all({
            enums: fetchEnums(),
            userEmail: fetchUserEmail()
        }).then(function (responses) {
            self.enums = responses.enums;
            self.limitStatus = getLimitStatus();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
