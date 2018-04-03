angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.billing.tollfree-history", {
        url: "/tollfree-history",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/billing/tollfreeHistory/telecom-telephony-billing-account-billing-tollfree-history.html",
                controller: "TelecomTelephonyBillingAccountBillingTollfreeHistoryCtrl",
                controllerAs: "TollfreeHistoryCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/billing/tollfreeHistory"]
    });
});
