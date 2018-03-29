angular.module("managerApp").controller("TelecomOrdersAccessoriesCtrl", function ($q, $state, $translate, OvhApiOrder, OvhApiTelephony, Toast) {
    "use strict";

    var self = this;

    self.billingAccounts = null;
    self.orderError = null;

    self.model = {
        billingAccount: null
    };

    self.loading = {
        init: false,
        submit: false
    };

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.orderAccessories = function () {
        self.loading.submit = true;
        self.orderError = null;

        return OvhApiTelephony.Line().v6().query({
            billingAccount: self.model.billingAccount.billingAccount
        }).$promise.then(function (lines) {
            if (lines.length) {
                return $state.go("telecom.telephony.line.phone.accessories", {
                    billingAccount: self.model.billingAccount.billingAccount,
                    serviceName: lines[0]
                }, {
                    reload: true
                });
            }
            return $q.reject(true);

        }).catch(function (err) {
            self.orderError = err;
        }).finally(function () {
            self.loading.submit = false;
        });
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return OvhApiOrder.Telephony().Aapi().billingAccounts().$promise.then(function (billingAccounts) {
            self.billingAccounts = billingAccounts;
            _.forEach(self.billingAccounts, function (elt) {
                elt.label = elt.description || elt.billingAccount;
            });
            return self.billingAccounts;
        }, function (error) {
            Toast.error([$translate.instant("telecom_orders_accessories_group_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
