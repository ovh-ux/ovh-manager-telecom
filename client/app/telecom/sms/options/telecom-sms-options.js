angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.options", {
        url: "/options",
        views: {
            smsInnerView: {
                templateUrl: "app/telecom/sms/options/telecom-sms-options.html",
                controller: "TelecomSmsOptionsCtrl",
                controllerAs: "TelecomSmsOptionsCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/options"
        ]
    });
});
