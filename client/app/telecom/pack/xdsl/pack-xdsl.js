angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl", {
        url: "/xdsl/:serviceName/lines/:number",
        views: {
            "packView@telecom.pack": {
                templateUrl: "app/telecom/pack/xdsl/pack-xdsl.html",
                controller: "PackXdslCtrl",
                controllerAs: "PackXdslCtrl"
            },
            "xdslView@telecom.pack.xdsl": {
                controller: "XdslAccessCtrl",
                controllerAs: "XdslAccess",
                templateUrl: "app/telecom/pack/xdsl/access/pack-xdsl-access.html"
            }
        },
        translations: [
            "common",
            "telecom/pack/xdsl",
            "telecom/pack/xdsl/access",
            "telecom/pack/xdsl/access/deconsolidation",
            "telecom/pack/xdsl/access/statistics",
            "telecom/pack/xdsl/access/ipv6",
            "telecom/pack/xdsl/access/lns",
            "telecom/pack/xdsl/access/portReset",
            "telecom/pack/xdsl/access/profil",
            "telecom/pack/xdsl/access/rateLimit",
            "telecom/pack/xdsl/access/ip/order",
            "telecom/pack/xdsl/orderFollowUp"
        ],
        resolve: {
            $title: function (translations, $translate, $stateParams, OvhApiXdsl) {
                return OvhApiXdsl.v6().get({
                    xdslId: $stateParams.serviceName
                }).$promise.then(function (data) {
                    return $translate.instant("xdsl_page_title", { name: data.description || $stateParams.serviceName }, null, null, "escape");
                }).catch(function () {
                    return $translate("xdsl_page_title", { name: $stateParams.serviceName });
                });
            }
        }
    });
});
