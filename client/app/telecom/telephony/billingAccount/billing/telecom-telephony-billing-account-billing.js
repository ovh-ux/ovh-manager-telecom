angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.billing", {
        url: "/billing",
        views: {
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/telecom-telephony-billing-account-billing.html",
                controller: "TelecomTelephonyBillingAccountBillingCtrl",
                controllerAs: "GroupBillingCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/billing"]
    });
});
