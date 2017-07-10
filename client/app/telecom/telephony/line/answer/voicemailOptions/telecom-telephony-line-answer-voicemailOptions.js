angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.voicemailOptions", {
        url: "/voicemailOptions",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/voicemailOptions/telecom-telephony-line-answer-voicemailOptions.html",
                controller: "TelecomTelephonyLineAnswerVoicemailOptionsCtrl",
                controllerAs: "VoicemailOptionsCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/answer/voicemailOptions"]
    });
});
