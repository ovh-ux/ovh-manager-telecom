angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.voicemailOptions", {
        url: "/voicemailOptions",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/voicemailOptions/telecom-telephony-line-answer-voicemailOptions.html",
                noTranslations: true
            },
            "@voicemailView": {
                templateUrl: "app/telecom/telephony/service/voicemail/options/telecom-telephony-service-voicemail-options.html",
                controller: "TelecomTelephonyServiceVoicemailOptionsCtrl",
                controllerAs: "VoicemailOptionsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/service/voicemail/options", "telecom/telephony/line/answer"]
    });
});
