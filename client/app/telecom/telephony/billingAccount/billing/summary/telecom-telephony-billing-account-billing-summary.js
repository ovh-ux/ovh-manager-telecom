angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.billing.summary", {
        url: "/summary",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/summary/telecom-telephony-billing-account-billing-summary.html",
                controller: "TelecomTelephonyBillingAccountBillingSummaryCtrl",
                controllerAs: "SummaryCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/billing/summary"]
    });
});
