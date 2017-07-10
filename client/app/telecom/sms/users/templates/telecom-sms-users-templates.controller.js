angular.module("managerApp").controller("TelecomSmsUsersTemplatesCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, service, SMS_ALERTS) {
    "use strict";

    var self = this;

    self.loading = {
        updateTemplates: false
    };
    self.updated = false;
    self.service = angular.copy(service);
    self.smsBodyMaxLength = _.get(SMS_ALERTS, "sms.bodyMaxLength");
    self.variables = _.get(SMS_ALERTS, "variables");

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return !_.isEqual(self.service.templates, service.templates);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    self.templates = function () {
        self.loading.updateTemplates = true;
        return $q.all([
            Sms.Lexi().put({
                serviceName: $stateParams.serviceName
            }, _.pick(self.service, "templates")).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.updateTemplates = false;
            self.updated = true;
            return $timeout(self.close, 1000);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        });
    };

    /* -----  End of ACTIONS  ------*/
});
