angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack", {
        url: "/pack/:packName",
        views: {
            telecomView: {
                templateUrl: "app/telecom/pack/pack-main.view.html"
            },
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/pack.html",
                controller: "PackCtrl",
                controllerAs: "Pack"
            }
        },
        resolve: {
            resiliationNotification: function () {
                return {};
            },
            $title: function (translations, $translate, OvhApiPackXdsl, $stateParams) {
                return OvhApiPackXdsl.Lexi().get({
                    packId: $stateParams.packName
                }).$promise.then(function (data) {
                    return $translate.instant("pack_xdsl_page_title", { name: data.description || $stateParams.packName }, null, null, "escape");
                }).catch(function () {
                    return $translate("pack_xdsl_page_title", { name: $stateParams.packName });
                });
            }
        },
        translations: ["common", "telecom/pack", "telecom/task"]
    });
});
