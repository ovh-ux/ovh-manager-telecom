angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.dashboard", {
        url: "/dashboard",
        views: {
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/dashboard/telecom-telephony-billing-account-dashboard.html",
                controller: "TelecomTelephonyBillingAccountDashboardCtrl",
                controllerAs: "DashboardCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/billingAccount/dashboard"
        ]
    });
});
