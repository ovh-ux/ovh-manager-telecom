angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.calls.filtering", {
        url: "/filtering",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/calls/filtering/telecom-telephony-line-calls-filtering.html",
                controller: "TelecomTelephonyLineCallsFilteringCtrl",
                controllerAs: "CallsFilteringCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/filtering"]
    });
});

