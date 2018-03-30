angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.stats.ovhPabx", {
        url: "/ovhPabx",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/stats/ovhPabx/telecom-telephony-alias-configuration-stats-ovhPabx.html",
                controller: "TelecomTelephonyAliasConfigurationStatsOvhPabxCtrl",
                controllerAs: "StatsOvhPabxCtrl"
            }
        },
        translations: ["common"]
    });
});
