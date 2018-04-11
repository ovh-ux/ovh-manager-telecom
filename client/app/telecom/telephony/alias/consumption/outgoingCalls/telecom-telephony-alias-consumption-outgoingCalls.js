angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.alias.consumption.outgoingCalls", {
        url: "/outgoingCalls",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/consumption/outgoingCalls/telecom-telephony-alias-consumption-outgoingCalls.html",
                controller: "TelecomTelephonyAliasConsumptionOutgoingCallsCtrl",
                controllerAs: "AliasOutgoingCallsCtrl"
            },
            "consumptionView@telecom.telephony.alias.consumption.outgoingCalls": {
                templateUrl: "app/telecom/telephony/service/consumption/outgoingCalls/telecom-telephony-service-consumption-outgoingCalls.html",
                controller: "TelecomTelephonyServiceConsumptionOutgoingCallsCtrl",
                controllerAs: "OutgoingCallsCtrl"
            }
        },
        translations: ["common"]
    });
});
