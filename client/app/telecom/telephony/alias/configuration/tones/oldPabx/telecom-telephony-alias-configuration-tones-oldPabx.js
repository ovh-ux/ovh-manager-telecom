angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.tones.oldPabx", {
        url: "/oldPabx",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/configuration/tones/oldPabx/telecom-telephony-alias-configuration-tones-oldPabx.html",
                controller: "TelecomTelephonyAliasConfigurationTonesOldPabxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
