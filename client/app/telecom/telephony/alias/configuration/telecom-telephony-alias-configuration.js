angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.alias.configuration", {
        url: "/configuration",
        views: {
            aliasInnerView: {
                templateUrl: "app/telecom/telephony/alias/configuration/telecom-telephony-alias-configuration.html",
                controller: "TelecomTelephonyAliasConfigurationCtrl",
                controllerAs: "AliasConfigurationCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/configuration"]
    });
});
