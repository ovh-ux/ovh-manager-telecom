angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.callsFiltering.oldPabx", {
        url: "/oldPabx",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/configuration/callsFiltering/oldPabx/telecom-telephony-alias-configuration-callsFiltering-oldPabx.html",
                controller: "TelecomTelephonyAliasConfigurationCallsFilteringOldPabxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common"]
    });
});
