angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.details", {
        url: "/details",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/phone/details/telecom-telephony-line-phone-details.html"
            },
            "@detailsView": {
                templateUrl: "app/telecom/telephony/line/details/telecom-telephony-line-details.html",
                controller: "TelecomTelephonyLineDetailsCtrl",
                controllerAs: "DetailsOfferCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/phone/details"]
    });
});
