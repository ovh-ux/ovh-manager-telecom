angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.contact", {
        url: "/contact",
        views: {
            "faxInnerView@telecop.telephony.fax": {
                templateUrl: "app/telecom/telephony/service/contact/telecom-telephony-service-contact.html",
                controller: "TelecomTelephonyServiceContactCtrl",
                controllerAs: "ServiceContactCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/fax",
            "telecom/telephony/service/contact"
        ]
    });
});
