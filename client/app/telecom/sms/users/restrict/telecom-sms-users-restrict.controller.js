angular.module("managerApp").controller("TelecomSmsUsersRestrictByIpCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, user) {
    "use strict";

    var self = this;

    self.loading = {
        restrictByIpUser: false
    };

    self.restricted = false;

    self.ipRestrictions = {
        threshold: 5,
        pattern: /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/
    };

    self.user = angular.copy(user);

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return !_.isEqual(_.without(self.user.ipRestrictions, ""), user.ipRestrictions);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.restrict = function () {
        self.loading.restrictByIpUser = true;

        return $q.all([
            Sms.Users().Lexi().edit({
                serviceName: $stateParams.serviceName,
                login: self.user.login
            }, {
                ipRestrictions: _.without(self.user.ipRestrictions, "")
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.restrictByIpUser = false;
            self.restricted = true;

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
        while (self.user.ipRestrictions.length < self.ipRestrictions.threshold) {
            self.user.ipRestrictions.push("");
        }
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
