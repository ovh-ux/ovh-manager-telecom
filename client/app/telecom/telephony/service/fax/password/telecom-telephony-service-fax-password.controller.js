angular.module("managerApp").controller("TelecomTelephonyServiceFaxPasswordCtrl", function ($stateParams, $translate, $timeout, TelephonyMediator, Telephony, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.reset = function () {
        self.passwordForm.password = "";
        self.passwordForm.confirm = "";
        self.passwordForm.isSuccess = false;
    };

    self.submitPasswordChange = function (form) {
        self.passwordForm.isUpdating = true;
        self.passwordForm.isSuccess = false;
        return Telephony.Fax().Lexi().changePassword({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, _.pick(self.passwordForm, "password")).$promise.then(function () {
            self.passwordForm.isSuccess = true;
            $timeout(function () {
                self.reset();
                form.$setPristine();
            }, 3000);
        }).catch(function (err) {
            Toast.error($translate.instant("telephony_service_fax_password_change_error", { error: _.get(err, "data.message") }));
        }).finally(function () {
            self.passwordForm.isUpdating = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false
        };

        self.fax = null;

        self.passwordForm = {
            password: null,
            confirm: null,
            isUpdating: false,
            isSuccess: false
        };

        self.loading.init = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
