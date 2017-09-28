angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.logs", {
        url: "/logs",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/service/assist/logs/telecom-telephony-service-assist-logs.html",
                controller: "TelecomTelephonyServiceAssistLogsCtrl",
                controllerAs: "LogsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/service/assist/logs"]
    });
});
