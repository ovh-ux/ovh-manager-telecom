angular.module("managerApp").controller("TelecomDashboardBillsCtrl", function (UserBill, ToastError, REDIRECT_URLS) {
    "use strict";

    var self = this;

    self.links = {
        billing: REDIRECT_URLS.billing
    };

    self.loaders = {
        bills: true
    };

    self.amountBillsDisplayed = 6;
    self.sortby = "date";
    self.reverse = true;

    /*= ================================
    =            API CALLS            =
    =================================*/

    function getLastBills () {
        return UserBill.Aapi().last().$promise.then(function (lastBills) {
            self.last = lastBills.slice(Math.max(lastBills.length - self.amountBillsDisplayed, 0));
        }, function (err) {
            ToastError(err);
        });
    }

    /* -----  End of API CALLS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loaders.bills = true;

        getLastBills().finally(function () {
            self.loaders.bills = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
