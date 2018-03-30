angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.answer", {
        url: "/answer",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/answer/telecom-telephony-line-answer.html",
                controller: "TelecomTelephonyLineAnswerCtrl",
                controllerAs: "LineAnswerCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/answer"]
    });
});
