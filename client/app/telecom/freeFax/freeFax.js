angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.freefax", {
        url: "/freefax/:serviceName",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/freeFax/freeFax.html"
            },
            "faxView@telecom.freefax": {
                templateUrl: "app/telecom/freeFax/freeFax-main.view.html",
                controller: "FreeFaxCtrl",
                controllerAs: "FreeFax"
            }
        },
        translations: ["common", "telecom/freeFax"],
        resolve: {
            $title: function (translations, $translate, $stateParams) {
                return $translate.instant("freefax_page_title", { name: $stateParams.serviceName }, null, null, "escape");
            }
        }
    });
});
