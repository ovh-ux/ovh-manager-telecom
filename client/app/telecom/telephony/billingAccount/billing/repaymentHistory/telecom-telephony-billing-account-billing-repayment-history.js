angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.billing.repayment-history", {
        url: "/repayment-history",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/repaymentHistory/telecom-telephony-billing-account-billing-repayment-history.html",
                controller: "TelecomTelephonyBillingAccountBillingRepaymentHistoryCtrl",
                controllerAs: "RepaymentHistoryCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/billing/repaymentHistory"]
    });
});
