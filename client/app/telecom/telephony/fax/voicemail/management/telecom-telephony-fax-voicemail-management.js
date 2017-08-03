angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.voicemail.management", {
        url: "/management",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/voicemail/management/telecom-telephony-fax-voicemail-management.html",
                noTranslations: true
            },
            "@voicemailView": {
                templateUrl: "app/telecom/telephony/service/voicemail/management/telecom-telephony-service-voicemail-management.html",
                controller: "TelecomTelephonyServiceVoicemailManagementCtrl",
                controllerAs: "VoicemailManagementCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/service/voicemail/management"
        ]
    });
});
