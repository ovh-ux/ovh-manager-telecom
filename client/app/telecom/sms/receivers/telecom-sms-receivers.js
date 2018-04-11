angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.receivers", {
        url: "/receivers",
        views: {
            "smsInnerView@telecom.sms": {
                templateUrl: "app/telecom/sms/receivers/telecom-sms-receivers.html",
                controller: "TelecomSmsReceiversCtrl",
                controllerAs: "SmsReceiversCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms",
            "telecom/sms/receivers"
        ]
    });
});
