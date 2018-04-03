angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.calls", {
        url: "/calls",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/telecom-telephony-line-calls.html",
                controller: "TelecomTelephonyLineCallsCtrl",
                controllerAs: "LineCallsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls"]
    });
});
