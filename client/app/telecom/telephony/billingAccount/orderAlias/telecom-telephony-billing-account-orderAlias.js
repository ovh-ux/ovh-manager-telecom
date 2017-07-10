angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.orderAlias", {
        url: "/orderAlias",
        views: {
            groupInnerView: {
                templateUrl: "app/telecom/telephony/billingAccount/orderAlias/telecom-telephony-billing-account-orderAlias.html"
            },
            "@telecomTelephonyBillingAccountOrderAliasView": {
                templateUrl: "app/telecom/telephony/billingAccount/orderAlias/telecom-telephony-billing-account-orderAlias-main.view.html",
                controller: "TelecomTelephonyBillingAccountOrderAliasCtrl",
                controllerAs: "AliasOrderCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/orderAlias"]
    });
});
