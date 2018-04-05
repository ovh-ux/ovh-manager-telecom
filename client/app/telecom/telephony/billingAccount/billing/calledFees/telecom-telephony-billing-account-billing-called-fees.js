angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.billing.calledFees", {
        url: "/calledFees",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/calledFees/telecom-telephony-billing-account-billing-called-fees.html",
                controller: "TelecomTelephonyBillingAccountBillingCalledFeesCtrl",
                controllerAs: "CalledFeesCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/billingAccount/billing/calledFees"
        ]
    });
});
