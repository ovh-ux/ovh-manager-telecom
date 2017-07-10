angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.sms.options.response", {
        url: "/response",
        views: {
            "@smsView": {
                templateUrl: "app/telecom/sms/options/response/telecom-sms-options-response.html",
                controller: "TelecomSmsOptionsResponseCtrl",
                controllerAs: "TelecomSmsOptionsResponseCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/options",
            "telecom/sms/options/response"
        ]
    });
});
