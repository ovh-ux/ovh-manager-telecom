angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.access-diagnostic", {
        url: "/diagnostic",
        views: {
            accessView: {
                controller: "XdslDiagnosticCtrl",
                controllerAs: "XdslDiagnostic",
                templateUrl: "app/telecom/pack/xdsl/access/diagnostic/pack-xdsl-access-diagnostic.html"
            }
        },
        translations: ["common", "telecom/pack/xdsl/access/diagnostic"]
    });
});
