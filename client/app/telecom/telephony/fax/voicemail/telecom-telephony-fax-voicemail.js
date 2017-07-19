angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.voicemail", {
        url: "/voicemail",
        views: {
            faxInnerView: {
                templateUrl: "app/telecom/telephony/fax/voicemail/telecom-telephony-fax-voicemail.html",
                controller: "TelecomTelephonyFaxVoicemailCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/fax/voicemail"]
    });
});
