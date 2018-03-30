angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist", {
        url: "/assist",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/assist/telecom-telephony-line-assist.html",
                controller: "TelecomTelephonyLineAssistCtrl",
                controllerAs: "LineAssistCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist"]
    });
});
