angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.line_displayNumber", {
        url: "/displayNumber",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/displayNumber/telecom-telephony-line-calls-displayNumber.html",
                controller: "TelecomTelephonyLineCallsDisplayNumberCtrl",
                controllerAs: "LineDisplayNumberCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/displayNumber"]
    });
});
