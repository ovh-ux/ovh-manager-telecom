angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.abbreviatedNumbers", {
        url: "/abbreviatedNumbers",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/abbreviatedNumbers/telecom-telephony-line-calls-abbreviatedNumbers.html",
                controller: "TelecomTelephonyLineCallsAbbreviatedNumbersCtrl",
                controllerAs: "LineAbbreviatedNumbersCtrl"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/telephony/line/calls/abbreviatedNumbers"
        ]
    });
});
