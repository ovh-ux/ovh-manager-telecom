angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.access-deconsolidation", {
        url: "/deconsolidation",
        views: {
            "accessView@telecom.pack.xdsl": {
                controller: "XdslDeconsolidationCtrl",
                controllerAs: "DeconCtrl",
                templateUrl: "app/telecom/pack/xdsl/access/deconsolidation/pack-xdsl-access-deconsolidation.html"
            }
        },
        translations: ["common", "telecom/pack/xdsl/access/deconsolidation", "telecom/pack/xdsl/access/deconsolidation/contract"]
    });
});
