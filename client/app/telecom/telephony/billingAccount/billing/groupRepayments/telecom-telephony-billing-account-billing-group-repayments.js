angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    return $stateProvider.state("telecom.telephony.billing.groupRepayments", {
        url: "/groupRepayments",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/groupRepayments/telecom-telephony-billing-account-billing-group-repayments.html",
                controller: "TelecomTelephonyBillingAccountBillingGroupRepaymentsCtrl",
                controllerAs: "GroupRepaymentsCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/billingAccount/billing/groupRepayments"
        ]
    });
});
