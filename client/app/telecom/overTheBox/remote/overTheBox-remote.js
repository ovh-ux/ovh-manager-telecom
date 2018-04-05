angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox.remote", {
        url: "/remote",
        views: {
            "otbView@telecom.overTheBox": {
                templateUrl: "app/telecom/overTheBox/remote/overTheBox-remote.html",
                controller: "OverTheBoxRemoteCtrl",
                controllerAs: "OverTheBoxRemote"
            }
        },
        translations: ["common", "telecom/overTheBox", "telecom/overTheBox/remote", "telecom/overTheBox/warning"]
    });
});
