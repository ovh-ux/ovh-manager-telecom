angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.line-diagnostic", {
        url: "/lineDiagnostic?type",
        views: {
            "accessView@telecom.pack.xdsl": {
                templateUrl: "app/telecom/pack/xdsl/access/linediagnostic/pack-xdsl-access-linediagnostic.html",
                controller: "PackxdslaccesslinediagnosticCtrl",
                controllerAs: "PackxdslaccesslinediagnosticCtrl"
            }
        },
        translations: ["common", "pack/xdsl/access/linediagnostic"]
    });

});
