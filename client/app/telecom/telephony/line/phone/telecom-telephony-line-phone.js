angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone", {
        url: "/phone",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/phone/telecom-telephony-line-phone.html",
                controller: "TelecomTelephonyLinePhoneCtrl",
                controllerAs: "LinePhoneCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/phone"]
    });
});
