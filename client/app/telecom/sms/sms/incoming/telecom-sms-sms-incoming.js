angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.sms.incoming", {
        url: "/incoming",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/sms/incoming/telecom-sms-sms-incoming.html",
                controller: "TelecomSmsSmsIncomingCtrl",
                controllerAs: "SmsIncomingCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/sms/incoming"
        ]
    });
});
