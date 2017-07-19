angular.module("managerApp").controller("TelecomTelephonyServiceVoicemailPasswordCtrl", function ($stateParams, $translate, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    function init () {
        self.options = null;
        self.loading = true;
        OvhApiTelephony.Line().Lexi().getOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (options) {
            self.options = options;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
        self.submitting = false;
        self.reset();
    }

    self.checkPasswordConfirm = function (form) {
        form.passwordConfirm.$setValidity("matching", true);
        if (self.passwordConfirm && self.passwordConfirm !== self.password) {
            form.passwordConfirm.$setValidity("matching", false);
        }
    };

    self.reset = function () {
        self.password = "";
        self.passwordConfirm = "";
        self.success = false;
    };

    self.submitPasswordChange = function (form) {
        self.submitting = true;
        self.success = false;
        return OvhApiTelephony.Voicemail().Lexi().changePassword({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            password: self.password
        }).$promise.then(function () {
            self.success = true;
            $timeout(function () {
                self.reset();
                form.$setPristine();
            }, 3000);
        }).catch(function () {
            return new ToastError($translate.instant("telephony_line_answer_voicemail_password_change_error"));
        }).finally(function () {
            self.submitting = false;
        });
    };

    init();
});
