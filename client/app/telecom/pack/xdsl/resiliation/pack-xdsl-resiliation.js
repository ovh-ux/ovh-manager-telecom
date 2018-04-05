angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.access-resiliation", {
        url: "/resiliation",
        views: {
            "accessView@telecom.pack.xdsl": {
                templateUrl: "app/telecom/pack/xdsl/resiliation/pack-xdsl-resiliation.html",
                controller: "PackXdslResiliationCtrl",
                controllerAs: "PackXdslResiliation"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/pack",
            "telecom/pack/xdsl/resiliation"
        ]
    });
});
