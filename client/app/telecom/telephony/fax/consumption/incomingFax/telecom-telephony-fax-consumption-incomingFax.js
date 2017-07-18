angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.consumption.incomingFax", {
        url: "/incomingFax",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/consumption/incomingFax/telecom-telephony-fax-consumption-incomingFax.html",
                controller: "TelecomTelephonyFaxConsumptionIncomingFaxCtrl",
                controllerAs: "$ctrl"
            },
            "@consumptionView": {
                templateUrl: "app/telecom/telephony/service/consumption/incomingFax/telecom-telephony-service-consumption-incomingFax.html",
                controller: "TelecomTelephonyServiceConsumptionIncomingFaxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
