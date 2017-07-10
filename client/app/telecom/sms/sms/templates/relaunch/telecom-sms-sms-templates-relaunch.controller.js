angular.module("managerApp").controller("TelecomSmsSmsTemplateRelaunchCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, template) {
    "use strict";
    var self = this;

    self.loading = {
        relaunchTemplate: false
    };

    self.relaunched = false;
    self.template = angular.copy(template);
    self.availableActivities = [];

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.relaunch = function () {
        self.loading.removeTemplate = true;

        return $q.all([
            Sms.Templates().Lexi().relaunchValidation({
                serviceName: $stateParams.serviceName,
                name: self.template.name
            }, {
                description: self.template.description,
                message: self.template.message
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.relaunchTemplate = false;
            self.relaunched = true;

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
