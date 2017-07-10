angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.phone.mgcpIpRestriction", {
        url: "/mgcpIpRestriction",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/phone/mgcpIpRestriction/telecom-telephony-line-phone-mgcpIpRestriction.html",
                controller: "TelecomTelephonyLinePhoneMgcpIpRestrictionCtrl",
                controllerAs: "MgcpIpRestrictionCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/phone/mgcpIpRestriction"]
    });
});
