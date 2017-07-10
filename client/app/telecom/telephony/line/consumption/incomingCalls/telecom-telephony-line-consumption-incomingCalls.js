angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.consumption.incomingCalls", {
        url: "/incomingCalls",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/consumption/incomingCalls/telecom-telephony-line-consumption-incomingCalls.html",
                controller: "TelecomTelephonyLineConsumptionIncomingCallsCtrl",
                controllerAs: "LineIncomingCallsCtrl"
            },
            "@consumptionView": {
                templateUrl: "app/telecom/telephony/service/consumption/incomingCalls/telecom-telephony-service-consumption-incomingCalls.html",
                controller: "TelecomTelephonyServiceConsumptionIncomingCallsCtrl",
                controllerAs: "IncomingCallsCtrl"
            }
        },
        translations: ["common"]
    });
});
