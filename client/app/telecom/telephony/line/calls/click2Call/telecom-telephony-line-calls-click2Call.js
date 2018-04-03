angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.click2call", {
        url: "/click2call",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/click2Call/telecom-telephony-line-calls-click2Call.html",
                controller: "TelecomTelephonyLineClick2CallCtrl",
                controllerAs: "Click2CallCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/line/calls",
            "telecom/telephony/line/calls/click2Call"
        ]
    });
});
