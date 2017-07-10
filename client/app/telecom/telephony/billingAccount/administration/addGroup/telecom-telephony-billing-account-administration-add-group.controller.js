angular.module("managerApp").controller("TelecomTelephonyBillingAccountAdministrationAddGroup", function ($stateParams, $translate, $timeout, OrderTelephony, ToastError) {
    "use strict";

    var self = this;

    function init () {
        self.loading = true;
        self.contractsAccepted = false;
        self.order = null;
        OrderTelephony.Lexi().getNewBillingAccount().$promise.then(function (result) {
            self.contracts = result.contracts;
            self.prices = result.prices;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    self.getDisplayedPrice = function () {
        if (self.prices.withTax.value === 0) {
            return $translate.instant("telephony_add_group_free");
        }
        return self.prices.withTax.text;

    };

    self.orderGroup = function () {
        self.ordering = true;
        return OrderTelephony.Lexi().orderNewBillingAccount().$promise.then(function (order) {
            self.order = order;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.ordering = false;
        });
    };

    init();
});
