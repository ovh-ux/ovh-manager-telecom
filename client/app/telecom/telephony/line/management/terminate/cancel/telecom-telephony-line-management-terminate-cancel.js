angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.terminate.cancel", {
        url: "/cancel",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/terminate/cancel/telecom-telephony-line-management-terminate-cancel.html",
                controller: "TelecomTelephonyLineTerminateCancelCtrl",
                controllerAs: "TerminateCancelCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/management/terminate", "telecom/telephony/line/management/terminate/cancel"]
    });
});
