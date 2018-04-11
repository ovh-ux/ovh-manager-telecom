angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.tones", {
        url: "/tones",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/tones/telecom-telephony-line-tones.html",
                controller: "TelecomTelephonyLineTonesCtrl",
                controllerAs: "LineTonesCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/tones"]
    });
});

