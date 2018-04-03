angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.forward", {
        url: "/forward",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/forward/telecom-telephony-line-calls-forward.html",
                controller: "TelecomTelephonyLineCallsForwardCtrl",
                controllerAs: "LineForwardCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/forward"]
    });
});
