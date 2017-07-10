angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.voicemailPassword", {
        url: "/voicemailPassword",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/voicemailPassword/telecom-telephony-line-answer-voicemailPassword.html",
                controller: "TelecomTelephonyLineAnswerVoicemailPasswordCtrl",
                controllerAs: "VoicemailPasswordCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/answer/voicemailPassword"]
    });
});
