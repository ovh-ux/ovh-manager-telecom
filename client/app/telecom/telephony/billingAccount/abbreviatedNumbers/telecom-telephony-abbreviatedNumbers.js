angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.abbreviatedNumbers", {
        url: "/abbreviatedNumbers",
        views: {
            groupInnerView: {
                templateUrl: "app/telecom/telephony/billingAccount/abbreviatedNumbers/telecom-telephony-abbreviatedNumbers.html",
                controller: "TelecomTelephonyAbbreviatedNumbersCtrl",
                controllerAs: "AbbreviatedNumbersCtrl"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/telephony/billingAccount",
            "telecom/telephony/billingAccount/abbreviatedNumbers"
        ]
    });
});
