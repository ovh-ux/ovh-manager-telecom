angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.phonebooks.create", {
        url: "/create",
        views: {
            "@smsView": {
                templateUrl: "app/telecom/sms/phonebooks/create/telecom-sms-phonebooks-create.html",
                controller: "TelecomSmsPhonebooksCreateCtrl",
                controllerAs: "PhonebooksCreateCtrl"
            }
        },
        translations: [
            "common",
            "telecom/sms/phonebooks",
            "telecom/sms/phonebooks/create"
        ]
    });
});
