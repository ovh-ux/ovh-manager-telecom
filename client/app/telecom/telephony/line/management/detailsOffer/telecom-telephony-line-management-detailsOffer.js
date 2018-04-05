angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.detailsOffer", {
        url: "/detailsOffer",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/detailsOffer/telecom-telephony-line-management-detailsOffer.html"
            },
            "detailsView@telecom.telephony.line.detailsOffer": {
                templateUrl: "app/telecom/telephony/line/details/telecom-telephony-line-details.html",
                controller: "TelecomTelephonyLineDetailsCtrl",
                controllerAs: "DetailsOfferCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/management"]
    });
});
