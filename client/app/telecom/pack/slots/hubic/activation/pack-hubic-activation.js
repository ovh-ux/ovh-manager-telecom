angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.hubic-activation", {
        url: "/hubic/activation",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/slots/hubic/activation/pack-hubic-activation.html",
                controller: "PackHubicActivationCtrl",
                controllerAs: "PackHubicActivation"
            }
        },
        translations: ["common", "telecom/pack/slots/hubic/activation"]
    });
});
