angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.consumption.outgoingFax", {
        url: "/outgoingFax",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/consumption/outgoingFax/telecom-telephony-line-consumption-outgoingFax.html",
                controller: "TelecomTelephonyLineConsumptionOutgoingFaxCtrl",
                controllerAs: "OutgoingFaxCtrl"
            }
        },
        translations: ["common"]
    });
});
