angular.module("managerApp").controller(
    "TelecomTelephonyLineCallsLockOutCallCtrl",
    function ($q, $stateParams, $translate, Toast, ToastError, OvhApiTelephony) {
        "use strict";

        var self = this;

        this.isPin = function (val) {
            return /^\d{4}$/.test(val) || !this.options.lockOutCall;
        };

        this.needSave = function () {
            return (this.options.lockOutCallPassword + this.options.lockOutCall) !== (self.saved.lockOutCallPassword + self.saved.lockOutCall);
        };

        this.cancel = function () {
            this.options = angular.copy(this.saved);
        };

        this.save = function () {
            self.loading.save = true;
            OvhApiTelephony.Line().Options().Lexi().update(
                {
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                },
                this.options
            ).$promise.then(
                function () {
                    self.saved = angular.copy(self.options);
                    Toast.success($translate.instant("telephony_line_actions_line_calls_out_lock_call_save_success"));
                },
                function () {
                    ToastError($translate.instant("telephony_line_actions_line_calls_out_lock_call_save_error"));
                }
            ).finally(function () {
                self.loading.save = false;
            });
        };

        function init () {
            self.loading = {
                init: true
            };
            self.options = {
                lockOutCallPassword: null,
                lockOutCall: null
            };
            self.saved = angular.copy(self.options);
            OvhApiTelephony.Line().Options().Lexi().get({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(
                function (options) {
                    self.options = _.pick(options, ["lockOutCallPassword", "lockOutCall"]);
                    self.saved = angular.copy(self.options);
                },
                function () {
                    ToastError($translate.instant("telephony_line_actions_line_calls_out_lock_call_load_error"));
                }
            ).finally(function () {
                self.loading.init = false;
            });
        }

        init();
    }
);
