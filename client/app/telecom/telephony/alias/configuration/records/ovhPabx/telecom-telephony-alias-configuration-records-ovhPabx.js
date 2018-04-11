angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.records.ovhPabx", {
        url: "/ovhPabx",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/records/ovhPabx/telecom-telephony-alias-configuration-records-ovhPabx.html",
                controller: "TelecomTelephonyAliasConfigurationRecordsOvhPabxCtrl",
                controllerAs: "RecordsOvhPabxCtrl"
            }
        },
        translations: ["common"]
    });
});
