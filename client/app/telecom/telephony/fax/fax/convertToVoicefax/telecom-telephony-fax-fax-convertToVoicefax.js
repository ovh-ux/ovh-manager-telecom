angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.fax.convertToVoicefax", {
        url: "/convertToVoicefax",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/fax/convertToVoicefax/telecom-telephony-fax-fax-convertToVoicefax.html",
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
