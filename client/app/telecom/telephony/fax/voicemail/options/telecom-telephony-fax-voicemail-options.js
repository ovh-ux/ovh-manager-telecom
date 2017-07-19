angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.voicemail.options", {
        url: "/options",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/voicemail/options/telecom-telephony-fax-voicemail-options.html",
                noTranslations: true
            },
            "@voicemailView": {
                templateUrl: "app/telecom/telephony/service/voicemail/options/telecom-telephony-service-voicemail-options.html",
                controller: "TelecomTelephonyServiceVoicemailOptionsCtrl",
                controllerAs: "VoicemailOptionsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/service/voicemail/options"]
    });
});
