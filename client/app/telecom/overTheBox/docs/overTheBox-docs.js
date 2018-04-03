angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox.docs", {
        url: "/docs",
        views: {
            "otbView@telecom.overTheBox": {
                templateUrl: "app/telecom/overTheBox/docs/overTheBox-docs.html",
                controller: "OverTheBoxDocsCtrl",
                controllerAs: "OverTheBoxDocs"
            }
        },
        translations: ["common", "telecom/overTheBox", "telecom/overTheBox/docs"]
    });
});
