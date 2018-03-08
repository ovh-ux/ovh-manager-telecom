angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.ovhPabx.tts", {
        url: "/tts",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/ovhPabx/tts/telecom-telephony-alias-configuration-ovhPabx-tts.html",
                controller: "TelecomTelephonyAliasConfigurationOvhPabxTtsCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/configuration/ovhPabx/tts", "../components/telecom/telephony/group/number/feature/ovhPabx/tts"]
    });
});
