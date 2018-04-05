angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.click2call.changePassword", {
        url: "/modify/:userId",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/click2Call/change-password/telecom-telephony-line-calls-click2Call-change-password.html",
                controller: "TelecomTelephonyLineClick2CallChangePasswordCtrl",
                controllerAs: "Click2CallChangePasswordCtrl"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/telephony/line/calls",
            "telecom/telephony/line/calls/click2Call",
            "telecom/telephony/line/calls/click2Call/change-password"
        ]
    });
});
