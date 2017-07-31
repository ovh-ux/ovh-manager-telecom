angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.fax.filtering", {
        url: "/filtering",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/fax/filtering/telecom-telephony-fax-fax-filtering.html",
                noTranslations: true
            },
            "@faxFilteringView": {
                templateUrl: "app/telecom/telephony/service/fax/filtering/telecom-telephony-service-fax-filtering.html",
                controller: "TelecomTelephonyServiceFaxFilteringCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
