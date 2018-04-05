angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.svaGenerator", {
        url: "/svaGenerator",
        views: {
            "aliasInnerView@telecom.telephony.alias": {
                templateUrl: "app/telecom/telephony/alias/svaGenerator/telecom-telephony-alias-svaGenerator.html",
                controller: "TelecomTelephonyAliasSvaGeneratorCtrl",
                controllerAs: "SvaGeneratorCtrl"
            }
        },
        translations: ["common"]
    });
});

