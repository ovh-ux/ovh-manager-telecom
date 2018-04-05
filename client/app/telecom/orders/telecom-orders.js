angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.orders", {
        url: "/orders",
        views: {
            "telecomView@telecom": {
                templateUrl: "app/telecom/orders/telecom-orders-main.view.html"
            },
            "ordersView@telecom.orders": {
                templateUrl: "app/telecom/orders/telecom-orders.html",
                controller: "TelecomOrdersCtrl",
                controllerAs: "OrdersCtrl"
            }
        },
        translations: ["common", "telecom/orders", "telecom/pack/common"],
        resolve: {
            $title: function (translations, $translate) {
                return $translate("telecom_order_page_title");
            }
        }
    });
});
