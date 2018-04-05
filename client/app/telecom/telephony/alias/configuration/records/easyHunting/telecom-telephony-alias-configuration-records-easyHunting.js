angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.records.easyHunting", {
        url: "/easyHunting",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/records/easyHunting/telecom-telephony-alias-configuration-records-easyHunting.html",
                controller: "TelecomTelephonyAliasConfigurationRecordsEasyHuntingCtrl",
                controllerAs: "RecordsEasyHuntingCtrl"
            }
        },
        translations: ["common"]
    });
});
