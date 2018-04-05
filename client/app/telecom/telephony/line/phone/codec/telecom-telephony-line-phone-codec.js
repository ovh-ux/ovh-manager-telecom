angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.codec", {
        url: "/codec",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/phone/codec/telecom-telephony-line-phone-codec.html",
                controller: "TelecomTelephonyLinePhoneCodecCtrl",
                controllerAs: "CodecCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/phone/codec"]
    });
});
