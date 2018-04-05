angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.members.oldPabx", {
        url: "/oldPabx",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/configuration/members/oldPabx/telecom-telephony-alias-configuration-members-oldPabx.html",
                controller: "TelecomTelephonyAliasConfigurationMembersOldPabxCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "../components/telecom/telephony/alias/members"]
    });
});
