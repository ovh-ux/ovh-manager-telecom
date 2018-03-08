angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.voipLine-activation", {
        url: "/telephony/activation",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/slots/voipLine/activation/pack-voipLine-activation.html",
                controller: "PackVoipLineActivationCtrl",
                controllerAs: "PackVoipLineActivationCtrl"
            }
        },
        translations: ["common", "telecom/pack", "telecom/pack/slots/voipLine/activation", "components"]
    });
});
