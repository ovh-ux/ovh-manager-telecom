angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.alias.consumption.incomingCalls", {
        url: "/incomingCalls",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/consumption/incomingCalls/telecom-telephony-alias-consumption-incomingCalls.html",
                controller: "TelecomTelephonyAliasConsumptionIncomingCallsCtrl",
                controllerAs: "AliasIncomingCallsCtrl"
            },
            "consumptionView@telecom.telephony.alias.consumption.incomingCalls": {
                templateUrl: "app/telecom/telephony/service/consumption/incomingCalls/telecom-telephony-service-consumption-incomingCalls.html",
                controller: "TelecomTelephonyServiceConsumptionIncomingCallsCtrl",
                controllerAs: "IncomingCallsCtrl"
            }
        },
        translations: ["common"]
    });
});
