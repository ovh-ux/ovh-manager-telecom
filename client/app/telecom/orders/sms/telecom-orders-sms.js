angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.orders-sms", {
        url: "/orders/sms",
        views: {
            telecomView: {
                templateUrl: "app/telecom/orders/sms/telecom-orders-sms.html"
            },
            "@smsOrderView": {
                templateUrl: "app/telecom/sms/order/telecom-sms-order.html",
                controller: "TelecomSmsOrderCtrl",
                controllerAs: "SmsOrder"
            }
        },
        translations: ["common", "telecom/orders/sms"]
    });
});
