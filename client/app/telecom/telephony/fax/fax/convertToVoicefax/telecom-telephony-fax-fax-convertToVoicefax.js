angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.fax.convertToVoicefax", {
        url: "/convertToVoicefax",
        views: {
            "telephonyView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/fax/fax/convertToVoicefax/telecom-telephony-fax-fax-convertToVoicefax.html",
                noTranslations: true,
                controller: "TelecomTelephonyFaxFaxConvertToVoiceFaxCtrl",
                controllerAs: "$ctrl"
            },
            "faxConvertToVoicefaxView@telecom.telephony.fax.fax.convertToVoicefax": {
                templateUrl: "app/telecom/telephony/service/fax/convertToVoicefax/telecom-telephony-service-fax-convertToVoicefax.html",
                controller: "TelecomTelephonyServiceFaxConvertToVoicefaxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/fax",
            "telecom/telephony/fax/fax"
        ]
    });
});
