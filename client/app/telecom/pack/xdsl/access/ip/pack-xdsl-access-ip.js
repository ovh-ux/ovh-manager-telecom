angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.pack.xdsl.access-ip", {
        url: "/ip/:block",
        views: {
            "accessView@telecom.pack.xdsl": {
                controller: "XdslAccessIpCtrl",
                controllerAs: "XdslAccessIp",
                templateUrl: "app/telecom/pack/xdsl/access/ip/pack-xdsl-access-ip.html"
            }
        },
        translations: [
            "common",
            "components",
            "telecom/pack/xdsl",
            "telecom/pack/xdsl/access",
            "telecom/pack/xdsl/access/ip",
            "telecom/pack/xdsl/access/ip/order"
        ]
    });
});
