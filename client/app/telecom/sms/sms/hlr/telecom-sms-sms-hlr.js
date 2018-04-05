angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.sms.hlr", {
        url: "/hlr",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/sms/hlr/telecom-sms-sms-hlr.html",
                controller: "TelecomSmsSmsHlrCtrl",
                controllerAs: "SmsHlrCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/dashboard",
            "telecom/sms/sms/hlr"
        ]
    });
});
