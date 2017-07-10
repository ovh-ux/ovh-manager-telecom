angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.siteBuilders", {
        url: "/siteBuilders",
        views: {
            telecomView: {
                templateUrl: "app/telecom/siteBuilders/telecom-siteBuilders.html",
                controller: "SiteBuildersCtrl",
                controllerAs: "SiteBuildersCtrl"
            }
        },
        translations: ["common", "telecom/siteBuilders"]
    });
});
