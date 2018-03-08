angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.resiliation", {
        url: "/resiliation",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/resiliation/pack-resiliation.html",
                controller: "PackResiliationCtrl",
                controllerAs: "PackResiliation"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/pack",
            "telecom/pack/resiliation"
        ]
    });
});
