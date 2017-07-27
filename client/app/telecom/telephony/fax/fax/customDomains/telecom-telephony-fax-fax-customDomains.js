angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.fax.customDomains", {
        url: "/customDomains",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/fax/customDomains/telecom-telephony-fax-fax-customDomains.html",
                noTranslations: true
            },
            "@faxCustomDomainsView": {
                templateUrl: "app/telecom/telephony/service/fax/customDomains/telecom-telephony-service-fax-customDomains.html",
                controller: "TelecomTelephonyServiceFaxCustomDomainsCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
