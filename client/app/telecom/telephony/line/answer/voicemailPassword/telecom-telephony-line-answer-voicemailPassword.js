angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.voicemailPassword", {
        url: "/voicemailPassword",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/voicemailPassword/telecom-telephony-line-answer-voicemailPassword.html",
                noTranslations: true
            },
            "@voicemailView": {
                templateUrl: "app/telecom/telephony/service/voicemail/password/telecom-telephony-service-voicemail-password.html",
                controller: "TelecomTelephonyServiceVoicemailPasswordCtrl",
                controllerAs: "VoicemailPasswordCtrl"
            }
        },
        translations: ["common", "telecom/telephony/service/voicemail/password", "telecom/telephony/line/answer"]
    });
});
