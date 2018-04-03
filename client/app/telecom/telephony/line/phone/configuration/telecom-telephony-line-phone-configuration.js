angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.configuration", {
        url: "/configuration",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/phone/configuration/telecom-telephony-line-phone-configuration.html",
                controller: "TelecomTelephonyLinePhoneConfigurationCtrl",
                controllerAs: "PhoneConfigCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/phone/configuration"]
    });
});
