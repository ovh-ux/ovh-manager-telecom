angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.rma", {
        url: "/rma",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/assist/rma/telecom-telephony-line-assist-rma.html",
                controller: "TelecomTelephonyLineAssistRmaCtrl",
                controllerAs: "RmaCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist/rma"]
    });
});

