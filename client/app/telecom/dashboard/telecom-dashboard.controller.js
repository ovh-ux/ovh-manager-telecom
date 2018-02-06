angular.module("managerApp").controller("TelecomDashboardCtrl", function (TelecomMediator, ToastError, URLS) {
    "use strict";

    var self = this;

    self.loading = {
        vip: false
    };

    self.expressLiteOrder = URLS.orderExpressLite;
    self.isVip = false;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.vip = true;

        return TelecomMediator.deferred.vip.promise.then(function (vipStatus) {
            self.isVip = vipStatus;
        }, function (err) {
            return new ToastError(err, "telecom_dashboard_auth_failed");
        }).finally(function () {
            self.loading.vip = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
