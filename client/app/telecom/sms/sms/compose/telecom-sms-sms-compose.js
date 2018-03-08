angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.sms.compose", {
        url: "/compose",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/sms/compose/telecom-sms-sms-compose.html",
                controller: "TelecomSmsSmsComposeCtrl",
                controllerAs: "SmsComposeCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/dashboard",
            "telecom/sms/sms/compose"
        ]
    });
});
