angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.fax.filtering", {
        url: "/filtering",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/fax/filtering/telecom-telephony-line-fax-filtering.html",
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
