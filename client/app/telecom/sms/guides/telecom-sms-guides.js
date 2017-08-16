angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.guides", {
        url: "/guides",
        views: {
            smsInnerView: {
                templateUrl: "app/telecom/sms/guides/telecom-sms-guides.html",
                controller: "TelecomSmsGuidesCtrl",
                controllerAs: "SmsGuidesCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/guides"
        ]
    });
});
