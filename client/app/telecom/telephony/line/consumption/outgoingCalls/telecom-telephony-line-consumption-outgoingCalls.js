angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.consumption.outgoingCalls", {
        url: "/outgoingCalls",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/consumption/outgoingCalls/telecom-telephony-line-consumption-outgoingCalls.html",
                controller: "TelecomTelephonyLineConsumptionOutgoingCallsCtrl",
                controllerAs: "LineOutgoingCallsCtrl"
            },
            "@consumptionView": {
                templateUrl: "app/telecom/telephony/service/consumption/outgoingCalls/telecom-telephony-service-consumption-outgoingCalls.html",
                controller: "TelecomTelephonyServiceConsumptionOutgoingCallsCtrl",
                controllerAs: "OutgoingCallsCtrl"
            }
        },
        translations: ["common"]
    });
});
