angular.module("managerApp").controller("TelecomTelephonyLinePhoneAccessoriesResumeCtrl", function ($q, TelephonyAccessoriesOrderProcess) {
    "use strict";

    var self = this;

    self.process = null;
    self.order = null;
    self.error = null;
    self.model = {
        contracts: false,
        retract: null
    };
    self.loading = {
        init: false
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;
        self.process = TelephonyAccessoriesOrderProcess.getOrderProcess();

        return TelephonyAccessoriesOrderProcess.getOrderCheckout().then(function (order) {

            _.remove(order.details, function (detail) {
                return ["SPECIAL", "MUTE"].indexOf(detail.detailType) > -1 || (_.isEqual(detail.detailType, "DELIVERY") && detail.totalPrice.value === 0);
            });

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
