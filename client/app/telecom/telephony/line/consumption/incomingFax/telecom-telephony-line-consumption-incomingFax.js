angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.consumption.incomingFax", {
        url: "/incomingFax",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/consumption/incomingFax/telecom-telephony-line-consumption-incomingFax.html",
                controller: "TelecomTelephonyLineConsumptionIncomingFaxCtrl",
                controllerAs: "IncomingFaxCtrl"
            }
        },
        translations: ["common"]
    });
});
