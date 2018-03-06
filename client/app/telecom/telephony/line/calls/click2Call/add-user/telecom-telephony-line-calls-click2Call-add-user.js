angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.click2call.addUser", {
        url: "/add",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/click2Call/add-user/telecom-telephony-line-calls-click2Call-add-user.html",
                controller: "TelecomTelephonyLineClick2CallAddUserCtrl",
                controllerAs: "Click2CallAddUserCtrl"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/telephony/line/calls",
            "telecom/telephony/line/calls/click2Call",
            "telecom/telephony/line/calls/click2Call/add-user"
        ]
    });
});
