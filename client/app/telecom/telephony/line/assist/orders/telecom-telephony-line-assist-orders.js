angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.assist.orders", {
        url: "/orders",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/assist/orders/telecom-telephony-line-assist-orders.html",
                controller: "TelecomTelephonyLineAssistOrdersCtrl",
                controllerAs: "OrdersCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/assist/orders"]
    });
});
