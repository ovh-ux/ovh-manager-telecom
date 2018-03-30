angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.phonebook", {
        url: "/phonebook",
        views: {
            "groupInnerView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/phonebook/telecom-telephony-billing-account-phonebook.html",
                controller: "TelecomTelephonyBillingAccountPhonebookCtrl",
                controllerAs: "PhonebookCtrl"
            }
        },
        translations: ["common", "telecom/telephony"]
    });
});
