angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.options.recredit", {
        url: "/recredit",
        views: {
            "smsView@telecom.sms": {
                templateUrl: "app/telecom/sms/options/recredit/telecom-sms-options-recredit.html",
                controller: "TelecomSmsOptionsRecreditCtrl",
                controllerAs: "TelecomSmsOptionsRecreditCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/options/recredit"
        ]
    });
});
