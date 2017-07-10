angular.module("managerApp").controller("TelecomSmsSmsTemplateAddCtrl", function ($q, $stateParams, $timeout, $translate, $uibModalInstance, Sms, SmsMediator) {
    "use strict";
    var self = this;

    this.template = {
        activity: null,
        description: null,
        message: null,
        name: null,
        reason: null
    };

    this.loading = {
        init: false,
        add: false
    };

    this.init = function init () {
        self.loading.init = true;
        return SmsMediator.getApiScheme().then(function (schema) {
            self.availableActivities = [];
            angular.forEach(schema.models["sms.TypeTemplateEnum"].enum, function (id) {
                self.availableActivities.push({
                    id: id,
                    label: $translate.instant("sms_sms_templates_add_activity_type_" + id)
                });
            });
            return self.availableActivities;
        }).finally(function () {
            self.loading.init = false;
        });
    };

    this.add = function add () {
        self.loading.add = true;
        return $q.all([
            Sms.Templates().Lexi().create({
                serviceName: $stateParams.serviceName
            }, self.template).$promise.catch(function (error) {
                return self.cancel({
                    type: "API",
                    msg: error
                });
            }),
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.add = false;
            self.added = true;
            return $timeout(self.close, 1500);
        });
    };

    this.cancel = function cancel (message) {
        return $uibModalInstance.dismiss(message);
    };

    this.close = function close () {
        return $uibModalInstance.close(true);
    };

    this.init();
});
