angular.module("managerApp").controller("TelecomTelephonyLinePhoneAccessoriesFinalizeCtrl", function ($q, TelephonyAccessoriesOrderProcess) {
    "use strict";

    var self = this;

    self.process = null;
    self.order = null;
    self.error = null;
    self.loading = {
        init: false
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;
        self.process = TelephonyAccessoriesOrderProcess.getOrderProcess();

        return TelephonyAccessoriesOrderProcess.orderCheckout().then(function (order) {
            self.order = order;
        }, function (error) {
            self.error = error;
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
