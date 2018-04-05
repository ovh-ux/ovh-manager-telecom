angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.orderAlias.nongeographical", {
        url: "/nonGeographical",
        views: {
            "telecomTelephonyBillingAccountOrderAliasView@telecom.telephony.orderAlias": {
                templateUrl: "app/telecom/telephony/billingAccount/orderAlias/nonGeographical/telecom-telephony-billing-account-orderAlias-nonGeographical.html",
                controller: "TelecomTelephonyAliasOrderNonGeographicalCtrl",
                controllerAs: "AliasOrderNonGeographicalCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/orderAlias", "telecom/telephony/billingAccount/orderAlias/nonGeographical"]
    });
});
