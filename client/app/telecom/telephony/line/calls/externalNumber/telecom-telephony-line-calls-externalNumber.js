angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.externalNumber", {
        url: "/externalNumber",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/externalNumber/telecom-telephony-line-calls-externalNumber.html",
                controller: "TelecomTelephonyLineCallsExternalNumberCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/externalNumber"]
    });
});
