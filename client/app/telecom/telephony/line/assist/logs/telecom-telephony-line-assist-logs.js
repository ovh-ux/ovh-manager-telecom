angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.logs", {
        url: "/logs",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/assist/logs/telecom-telephony-line-assist-logs.html",
                controller: "TelecomTelephonyLineAssistLogsCtrl",
                controllerAs: "LogsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist/logs"]
    });
});
