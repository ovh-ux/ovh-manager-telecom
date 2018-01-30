angular.module("managerApp").controller("TelecomDashboardBillsCtrl", function (OvhApiMeBill, ToastError, REDIRECT_URLS) {
    "use strict";

    const self = this;

    self.links = {
        billing: REDIRECT_URLS.billing
    };
    self.amountBillsDisplayed = 6;

    /*= ================================
    =            API CALLS            =
    =================================*/

    function getLastBills () {
        return OvhApiMeBill.Aapi().last().$promise.then(function (bills) {
            self.lastBills = bills;
        }).catch((err) => {
            self.lastBills = [];
            return new ToastError(err);
        });
    }

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/
    self.$onInit = function () {
        getLastBills();
    };

});
