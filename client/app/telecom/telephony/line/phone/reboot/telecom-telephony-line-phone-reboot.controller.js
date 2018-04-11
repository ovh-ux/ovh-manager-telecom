angular.module("managerApp").controller("TelecomTelephonyLinePhoneRebootCtrl", function ($q, $stateParams, $translate, $timeout, Toast, ToastError, OvhApiTelephony, TelephonyMediator) {
    "use strict";

    var self = this;

    function init () {
        self.isLoading = true;
        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getLine($stateParams.serviceName).getPhone();
        }).then(function (phone) {
            self.phone = phone;
            self.isRebootable = /^phone\.(thomson|swissvoice)/.test(self.phone.brand);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.reboot = function () {
        self.isRebooting = true;
        OvhApiTelephony.Line().Phone().v6().reboot({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            self.rebootSuccess = true;
            $timeout(function () {
                self.rebootSuccess = false;
            }, 3000);
            Toast.success($translate.instant("telephony_line_phone_reboot_success"));
        }).catch(function (err) {
            if (err && err.status === 501) {
                Toast.error($translate.instant("telephony_line_phone_reboot_unsupported"));
            } else {
                Toast.error([$translate.instant("telephony_line_phone_reboot_error"), _.get(err, "data.message")].join(" "));
            }
        }).finally(function () {
            self.isRebooting = false;
        });
    };

    init();
});
