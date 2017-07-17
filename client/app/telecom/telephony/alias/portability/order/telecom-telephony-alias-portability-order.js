angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.alias.portabilityOrder", {
        url: "/alias/:serviceName/portabilityOrder",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/alias/portability/order/telecom-telephony-alias-portability-order.html",
                controller: "TelecomTelephonyAliasPortabilityOrderCtrl",
                controllerAs: "PortabilityOrderCtrl"
            }
        },
        translations: ["common", "telecom/telephony/alias/portability/order"]
    });
});
