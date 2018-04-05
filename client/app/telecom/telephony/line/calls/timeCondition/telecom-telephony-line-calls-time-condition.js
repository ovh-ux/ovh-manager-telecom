angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.calls.timeCondition", {
        url: "/timeCondition",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/timeCondition/telecom-telephony-line-calls-time-condition.html",
                controller: "TelecomTelephonyLineCallsTimeConditionCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "common/telephony", "telecom/telephony/line/calls/timeCondition", "../components/telecom/telephony/timeCondition/slot"]
    });

});
