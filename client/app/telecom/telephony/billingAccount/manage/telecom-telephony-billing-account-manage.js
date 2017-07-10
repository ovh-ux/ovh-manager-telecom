angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.BillingAccount.manage", {
        url: "/manage",
        views: {
            groupView: {
                templateUrl: "app/telecom/telephony/billingAccount/manage/telecom-telephony-billing-account-manage.html",
                controller: "TelecomTelephonyBillingAccountManageCtrl",
                controllerAs: "TelecomTelephonyBillingAccountManageCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/manage"]
    });
});
