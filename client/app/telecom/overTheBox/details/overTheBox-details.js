angular.module("managerApp").config(
    function ($stateProvider) {
        "use strict";
        $stateProvider.state("telecom.overTheBox.details", {
            url: "/details",
            views: {
                "otbView@telecom.overTheBox": {
                    templateUrl: "app/telecom/overTheBox/details/overTheBox-details.html",
                    controller: "OverTheBoxDetailsCtrl",
                    controllerAs: "OverTheBoxDetails"
                }
            },
            translations: [
                "common",
                "telecom/overTheBox/details",
                "telecom/overTheBox/warning",
                "telecom/overTheBox/remote"
            ]
        });
    });
