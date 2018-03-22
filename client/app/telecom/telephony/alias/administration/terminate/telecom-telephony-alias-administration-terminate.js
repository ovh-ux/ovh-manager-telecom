angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.administration.terminate", {
        url: "/terminate",
        views: {
            "aliasView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/administration/terminate/telecom-telephony-alias-administration-terminate.html",
                controller: "TelecomTelephonyAliasAdministrationTerminateCtrl",
                controllerAs: "AliasTerminateCtrl"
            }
        },
        translations: ["common"]
    });
});
