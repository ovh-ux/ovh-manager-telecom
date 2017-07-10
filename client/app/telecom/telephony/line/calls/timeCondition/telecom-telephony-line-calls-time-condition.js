angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.calls.timeCondition", {
        url: "/timeCondition",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/calls/timeCondition/telecom-telephony-line-calls-time-condition.html",
                controller: "TelecomTelephonyLineCallsTimeConditionCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/timeCondition", "../components/telecom/telephony/timeCondition/slot"]
    });

});
