angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.voicemailManagement", {
        url: "/voicemailManagement",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/answer/voicemailManagement/telecom-telephony-line-answer-voicemailManagement.html",
                controller: "TelecomTelephonyLineAnswerVoicemailManagementCtrl",
                controllerAs: "VoicemailManagementCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/answer/voicemailManagement"]
    });
});
