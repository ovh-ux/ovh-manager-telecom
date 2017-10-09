angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.fax.password", {
        url: "/password",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/fax/password/telecom-telephony-line-fax-password.html",
                noTranslations: true
            },
            "@faxPasswordView": {
                templateUrl: "app/telecom/telephony/service/fax/password/telecom-telephony-service-fax-password.html",
                controller: "TelecomTelephonyServiceFaxPasswordCtrl",
                controllerAs: "PasswordCtrl"
            }
        },
        translations: ["common"]
    });
});
