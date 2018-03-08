angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.move", {
        url: "/move",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/move/pack-move.html",
                controller: "PackMoveCtrl",
                controllerAs: "PackMove"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/pack",
            "telecom/pack/move",
            "telecom/pack/move/contract"
        ]
    });
});
