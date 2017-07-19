angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.voicemail.default", {
        url: "/default",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/voicemail/default/telecom-telephony-fax-voicemail-default.html",
                noTranslations: true
            },
            "@voicemailView": {
                templateUrl: "app/telecom/telephony/service/voicemail/default/telecom-telephony-service-voicemail-default.html",
                controller: "TelecomTelephonyServiceVoicemailDefaultCtrl",
                controllerAs: "DefaultVoicemailCtrl"
            }
        },
        translations: ["common", "telecom/telephony/service/voicemail/default"]
    });
});
