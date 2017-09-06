angular.module("managerApp").controller("TelecomOrdersAliasCtrl", function (OvhApiOrder, Toast, $q, $translate, $state) {
    "use strict";

    var self = this;

    /*= =============================
    =            EVENTS            =
    ==============================*/

    this.submit = function () {
        return $state.go(
            "telecom.telephony.orderAlias",
            {
                billingAccount: self.billingAccount.billingAccount
            },
            {
                reload: true
            }
        );
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: true
        };

        OvhApiOrder.Telephony().Aapi().billingAccounts().$promise.then(
            function (billingAccounts) {
                self.orderAccounts = _.filter(billingAccounts, { status: "enabled" });
                _.forEach(self.orderAccounts, function (elt) {
                    elt.label = elt.description || elt.billingAccount;
                });
                return self.orderAccounts;
            },
            function (err) {
                Toast.error($translate.instant("telecom_orders_alias_billing_loading_error"));
                return $q.reject(err);
            }
        ).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
