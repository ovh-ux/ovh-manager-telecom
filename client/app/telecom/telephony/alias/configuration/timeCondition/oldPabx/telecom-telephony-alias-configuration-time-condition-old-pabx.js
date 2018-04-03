angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.timeCondition.oldPabx", {
        url: "/oldPabx",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/timeCondition/oldPabx/telecom-telephony-alias-configuration-time-condition-old-pabx.html",
                controller: "TelecomTelephonyAliasConfigurationTimeConditionOldPabxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "common/telephony", "telecom/telephony/alias/configuration/timeCondition", "../components/telecom/telephony/timeCondition/slot"]
    });

});
