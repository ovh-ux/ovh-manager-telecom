angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.lockOutCall", {
        url: "/lockOutCall",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/lockOutCall/telecom-telephony-line-calls-lockOutCall.html",
                controller: "TelecomTelephonyLineCallsLockOutCallCtrl",
                controllerAs: "LineLockOutCallCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/lockOutCall"]
    });
});
