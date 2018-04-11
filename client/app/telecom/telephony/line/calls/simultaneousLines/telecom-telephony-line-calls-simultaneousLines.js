angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.simultaneousLines", {
        url: "/simultaneousLines",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/simultaneousLines/telecom-telephony-line-calls-simultaneousLines.html",
                controller: "TelecomTelephonyLineCallsSimultaneousLinesCtrl",
                controllerAs: "LineSimultaneousLinesCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/simultaneousLines"]
    });
});
