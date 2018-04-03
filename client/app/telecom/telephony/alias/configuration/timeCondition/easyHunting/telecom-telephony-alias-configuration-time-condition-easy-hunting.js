angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.timeCondition.easyHunting", {
        url: "/easyHunting",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/timeCondition/easyHunting/telecom-telephony-alias-configuration-time-condition-easy-hunting.html",
                controller: "TelecomTelephonyAliasConfigurationTimeConditionEasyHuntingCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "common/telephony", "telecom/telephony/alias/configuration/timeCondition", "../components/telecom/telephony/timeCondition/slot"]
    });

});
