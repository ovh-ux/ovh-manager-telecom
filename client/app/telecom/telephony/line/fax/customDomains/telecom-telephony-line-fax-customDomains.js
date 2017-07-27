angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.fax.customDomains", {
        url: "/customDomains",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/fax/customDomains/telecom-telephony-line-fax-customDomains.html",
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
