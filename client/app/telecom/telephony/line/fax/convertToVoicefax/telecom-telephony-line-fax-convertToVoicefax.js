angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.fax.convertToVoicefax", {
        url: "/convertToVoicefax",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/fax/convertToVoicefax/telecom-telephony-line-fax-convertToVoicefax.html",
                noTranslations: true
            },
            "@faxConvertToVoicefaxView": {
                templateUrl: "app/telecom/telephony/service/fax/convertToVoicefax/telecom-telephony-service-fax-convertToVoicefax.html",
                controller: "TelecomTelephonyServiceFaxConvertToVoicefaxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
