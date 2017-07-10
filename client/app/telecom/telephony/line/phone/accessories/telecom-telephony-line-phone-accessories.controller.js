angular.module("managerApp").controller("TelecomTelephonyLinePhoneAccessoriesCtrl", function ($q, $stateParams, $translate, TelephonyMediator, TelephonyAccessoriesOrderProcess, Toast) {
    "use strict";

    var self = this;

    self.process = null;

    self.loading = {
        init: false
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function () {
            self.process = TelephonyAccessoriesOrderProcess.init($stateParams.billingAccount);
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_phone_accessories_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.error(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
