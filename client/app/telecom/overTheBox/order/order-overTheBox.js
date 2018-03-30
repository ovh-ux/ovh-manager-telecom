angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.overTheBox-order", {
        url: "/overTheBox/order",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/overTheBox/order/order-overTheBox.html",
                controller: "OrderOverTheBoxCtrl",
                controllerAs: "OrderOverTheBox"
            }
        },
        translations: ["common", "telecom/overTheBox", "telecom/overTheBox/order", "telecom/overTheBox/warning"]
    });
});
