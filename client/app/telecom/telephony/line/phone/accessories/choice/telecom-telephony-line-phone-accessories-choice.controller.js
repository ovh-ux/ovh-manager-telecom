angular.module("managerApp").controller("TelecomTelephonyLinePhoneAccessoriesChoiceCtrl", function ($q, $translate, TelephonyAccessoriesOrderProcess) {
    "use strict";

    var self = this;

    self.process = null;
    self.orderTotal = null;

    self.loading = {
        init: false
    };
    self.error = {
        loading: null
    };
    self.spinnerExtremities = {
        min: 0,
        max: 100
    };

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasAtLeastOneAccessory = function () {
        return !!_.find(self.process.accessoriesList, function (accessory) {
            return accessory.quantity > 0;
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.updateOrderTotal = function () {
        var total = 0;
        angular.forEach(self.process.accessoriesList, function (accessory) {
            total += accessory.price.value * accessory.quantity;
        });

        self.orderTotal = TelephonyAccessoriesOrderProcess.getPriceStruct(total);
        return self.orderTotal;
    };

    self.validateStep = function () {
        self.process.currentView = "shipping";
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyAccessoriesOrderProcess.getAvailableAccessories().then(function (orderProcess) {
            self.process = orderProcess;
            self.chunkedList = _.chunk(self.process.accessoriesList, 4);
            self.orderTotal = TelephonyAccessoriesOrderProcess.getPriceStruct(0);
        }, function (error) {
            self.error.loading = error;
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
