angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.line.terminate", {
        url: "/terminate",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/terminate/telecom-telephony-line-management-terminate.html",
                controller: "TelecomTelephonyLineTerminateCtrl",
                controllerAs: "TerminateCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/management", "telecom/telephony/line/management/terminate"]
    });
});
