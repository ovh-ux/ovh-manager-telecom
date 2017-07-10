angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.defaultVoicemail", {
        url: "/defaultVoicemail",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/defaultVoicemail/telecom-telephony-line-answer-defaultVoicemail.html",
                controller: "TelecomTelephonyLineAnswerDefaultVoicemailCtrl",
                controllerAs: "DefaultVoicemailCtrl"
            }
        },
        translations: ["common"]
    });
});
