angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.programmableKeys", {
        url: "/programmableKeys",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/phone/programmableKeys/telecom-telephony-line-phone-programmableKeys.html",
                controller: "TelecomTelephonyLinePhoneProgammableKeysCtrl",
                controllerAs: "ProgrammableKeysCtrl"
            }
        },
        translations: ["common"]
    });
});
