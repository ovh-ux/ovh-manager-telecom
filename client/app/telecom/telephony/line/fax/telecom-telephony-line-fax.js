angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.fax", {
        url: "/fax",
        views: {
            "lineInnerView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/fax/telecom-telephony-line-fax.html",
                controller: "TelecomTelephonyLineFaxCtrl",
                controllerAs: "LineFaxCtrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/line/fax"
        ]
    });
});
