angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.consumption.outgoingFax", {
        url: "/outgoingFax",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/consumption/outgoingFax/telecom-telephony-fax-consumption-outgoingFax.html"
            },
            "@consumptionView": {
                templateUrl: "app/telecom/telephony/service/consumption/outgoingFax/telecom-telephony-service-consumption-outgoingFax.html",
                controller: "TelecomTelephonyServiceConsumptionOutgoingFaxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
