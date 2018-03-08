angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.sms.pending", {
        url: "/pending",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/sms/pending/telecom-sms-sms-pending.html",
                controller: "TelecomSmsSmsPendingCtrl",
                controllerAs: "SmsPendingCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/sms/pending"
        ]
    });
});
