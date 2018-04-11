angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationLiveCallsInterceptCtrl", function ($uibModalInstance, $translate, Toast, params) {
    "use strict";

    var self = this;

    self.$onInit = function () {
        self.number = null;
        self.error = null;
        self.isSubmitting = false;
    };

    self.cancel = function () {
        $uibModalInstance.dismiss();
    };

    self.submit = function () {
        self.isSubmitting = true;
        self.error = null;
        return params.apiEndpoint.Hunting().Queue().LiveCalls().v6().intercept({
            billingAccount: params.billingAccount,
            serviceName: params.serviceName,
            queueId: params.queueId,
            id: params.callId
        }, {
            number: self.number
        }).$promise.then(function () {
            $uibModalInstance.dismiss();
            Toast.success($translate.instant("telephony_alias_configuration_mode_calls_action_intercept_success"));
        }).catch(function (err) {
            self.error = _.get(err, "data.message") || _.get(err, "message") || err;
        }).finally(function () {
            self.isSubmitting = false;
        });
    };
});
