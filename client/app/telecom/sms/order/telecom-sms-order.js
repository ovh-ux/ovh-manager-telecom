angular.module("managerApp").config(($stateProvider) => {
    "use strict";
    $stateProvider.state("telecom.sms.order", {
        url: "/order",
        views: {
            "smsInnerView@telecom.sms": {
                templateUrl: "app/telecom/sms/order/telecom-sms-order.html",
                controller: "TelecomSmsOrderCtrl",
                controllerAs: "SmsOrder"
            }
        },
        translations: [
            "common",
            "telecom/sms/order"
        ]
    });
}).constant("SMS_ORDER_PREFIELDS_VALUES", [
    100,
    500,
    1000,
    5000,
    10000,
    50000,
    100000,
    500000,
    NaN
]);
