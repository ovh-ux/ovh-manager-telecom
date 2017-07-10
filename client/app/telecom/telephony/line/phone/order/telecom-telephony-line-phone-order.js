angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.phone.order", {
        url: "/order",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/phone/order/telecom-telephony-line-phone-order.html",
                controller: "TelecomTelephonyLinePhoneOrderCtrl",
                controllerAs: "PhoneOrderCtrl"
            }
        },
        translations: ["common"]
    });
});
