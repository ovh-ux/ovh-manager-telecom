angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.sms.outgoing", {
        url: "/outgoing",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/sms/outgoing/telecom-sms-sms-outgoing.html",
                controller: "TelecomSmsSmsOutgoingCtrl",
                controllerAs: "SmsOutgoingCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/sms/outgoing"
        ]
    });
});
