angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.orderAlias.international", {
        url: "/international",
        views: {
            "telecomTelephonyBillingAccountOrderAliasView@telecom.telephony.orderAlias": {
                templateUrl: "app/telecom/telephony/billingAccount/orderAlias/international/telecom-telephony-billing-account-orderAlias-international.html",
                controller: "TelecomTelephonyAliasOrderInternationalCtrl",
                controllerAs: "AliasOrderInternationalCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/orderAlias", "telecom/telephony/billingAccount/orderAlias/international"]
    });
});
