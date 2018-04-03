angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.administration", {
        url: "/administration",
        views: {
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/administration/telecom-telephony-billing-account-administration.html",
                controller: "TelecomTelephonyBillingAccountAdministrationCtrl",
                controllerAs: "BillingAccountAdministrationCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/billing"]
    });
});
