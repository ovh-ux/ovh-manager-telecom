angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.senders", {
        url: "/senders",
        views: {
            "smsInnerView@telecom.sms": {
                templateUrl: "app/telecom/sms/senders/telecom-sms-senders.html",
                controller: "TelecomSmsSendersCtrl",
                controllerAs: "SmsSendersCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/senders",
            "telecom/sms/senders/add"
        ]
    });
});
