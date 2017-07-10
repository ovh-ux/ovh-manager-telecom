angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.configuration.members.easyHunting", {
        url: "/easyHunting",
        views: {
            "@aliasView": {
                templateUrl: "app/telecom/telephony/alias/configuration/members/easyHunting/telecom-telephony-alias-configuration-members-easyHunting.html",
                controller: "TelecomTelephonyAliasConfigurationMembersEasyHuntingCtrl",
                controllerAs: "MembersEasyHuntingCtrl"
            }
        },
        translations: ["common"]
    });
});
