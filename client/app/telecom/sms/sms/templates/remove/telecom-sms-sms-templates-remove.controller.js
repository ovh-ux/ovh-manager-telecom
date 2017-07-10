angular.module("managerApp").controller("TelecomSmsSmsTemplateRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, template) {
    "use strict";
    var self = this;

    self.loading = {
        removeTemplate: false
    };

    self.removed = false;
    self.template = angular.copy(template);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.remove = function () {
        self.loading.removeTemplate = true;

        return $q.all([
            Sms.Templates().Lexi().delete({
                serviceName: $stateParams.serviceName,
                name: self.template.name
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeTemplate = false;
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
