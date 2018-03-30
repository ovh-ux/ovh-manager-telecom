angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.mgcpIpRestriction", {
        url: "/mgcpIpRestriction",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/mgcpIpRestriction/telecom-telephony-line-mgcpIpRestriction.html",
                controller: "TelecomTelephonyLineMgcpIpRestrictionCtrl",
                controllerAs: "MgcpIpRestrictionCtrl"
            }
        },
        translations: ["telecom/telephony/line/management/mgcpIpRestriction"]
    });
});
