angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.callWaiting", {
        url: "/callWaiting",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/callWaiting/telecom-telephony-line-calls-callWaiting.html",
                controller: "TelecomTelephonyLineCallsCallWaitingCtrl",
                controllerAs: "LineCallWaitingCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/callWaiting"]
    });
});
