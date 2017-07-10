angular.module("managerApp").controller("TelecomSmsSmsTemplateEditCtrl", function ($q, $stateParams, $timeout, $translate, $uibModalInstance, Sms, SmsMediator, template, ToastError) {
    "use strict";
    var self = this;

    self.loading = {
        init: false,
        edit: false
    };

    self.edited = false;
    self.template = angular.copy(template);
    self.availableActivities = [];

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.hasChanged = function () {
        return !(
            self.template.name === template.name &&
            self.template.activity === template.activity &&
            self.template.description === template.description &&
            self.template.message === template.message &&
            self.template.status === template.status
        );
    };

    self.edit = function () {
        self.loading.edit = true;

        return $q.all([
            Sms.Templates().Lexi().edit({
                serviceName: $stateParams.serviceName,
                name: self.template.name
            }, self.template).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.add = false;
            self.edited = true;

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

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return SmsMediator.getApiScheme().then(function (schema) {
            self.availableActivities = schema.models["sms.TypeTemplateEnum"].enum;
            return self.availableActivities;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
