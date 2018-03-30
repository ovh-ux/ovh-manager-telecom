// This page is reached from OverTheBox device
angular.module("managerApp").config(function ($stateProvider, $urlRouterProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox-configure", {
        url: "/overTheBox/configure",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/overTheBox/configure/overTheBox-configure.html",
                controller: "OverTheBoxConfigureCtrl",
                controllerAs: "OverTheBoxConfigure"
            }
        },
        translations: ["common", "telecom/overTheBox", "telecom/overTheBox/configure"]
    });

    // special redirection for /configure/overTheBox which is inside internal OTB UX
    $urlRouterProvider.when("/configure/overTheBox", "/overTheBox/configure");
});
