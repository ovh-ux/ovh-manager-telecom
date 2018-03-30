angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.phonebook", {
        url: "/phonebook",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/phone/phonebook/telecom-telephony-line-phone-phonebook.html",
                controller: "TelecomTelephonyLinePhonePhonebookCtrl",
                controllerAs: "PhonebookCtrl"
            }
        },
        translations: ["common", "telecom/telephony"]
    });
});
