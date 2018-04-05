angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.billing.deposit", {
        url: "/deposit",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/deposit/telecom-telephony-billing-account-billing-deposit.html",
                controller: "TelecomTelephonyBillingAccountBillingDepositCtrl",
                controllerAs: "BillingDepositCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/billingAccount/billing",
            "telecom/telephony/billingAccount/billing/deposit"
        ]
    });
});
