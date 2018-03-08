angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.orderAlias.special", {
        url: "/special",
        views: {
            "telecomTelephonyBillingAccountOrderAliasView@telecom.telephony.orderAlias": {
                templateUrl: "app/telecom/telephony/billingAccount/orderAlias/special/telecom-telephony-billing-account-orderAlias-special.html",
                controller: "TelecomTelephonyAliasOrderSpecialCtrl",
                controllerAs: "AliasOrderSpecialCtrl"
            }
        },
        translations: ["common", "telecom/telephony", "telecom/telephony/billingAccount/orderAlias", "telecom/telephony/billingAccount/orderAlias/special"]
    });
});
