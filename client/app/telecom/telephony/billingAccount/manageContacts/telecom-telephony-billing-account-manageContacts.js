angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.manageContacts", {
        url: "/manageContacts",
        views: {
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/manageContacts/telecom-telephony-billing-account-manageContacts.html",
                controller: "TelecomTelephonyBillingAccountManageContactsCtrl",
                controllerAs: "ManageContactsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/billingAccount/manageContacts"]
    });
});
