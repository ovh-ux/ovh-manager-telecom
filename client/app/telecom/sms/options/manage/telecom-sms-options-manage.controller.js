angular.module("managerApp").controller("TelecomSmsOptionsManageCtrl", function ($uibModal, SmsMediator, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.service = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.update = function (service) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/manage/update/telecom-sms-options-manage-update.html",
            controller: "TelecomSmsOptionsManageUpdateCtrl",
            controllerAs: "OptionsManageUpdateCtrl",
            resolve: {
                service: function () { return service; }
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return SmsMediator.initDeferred.promise.then(function () {
            self.service = SmsMediator.getCurrentSmsService();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
