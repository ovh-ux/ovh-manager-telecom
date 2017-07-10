angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.support", {
        url: "/support",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/assist/support/telecom-telephony-line-assist-support.html",
                controller: "TelecomTelephonyLineAssistSupportCtrl",
                controllerAs: "SupportCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist/support"]
    });
});
