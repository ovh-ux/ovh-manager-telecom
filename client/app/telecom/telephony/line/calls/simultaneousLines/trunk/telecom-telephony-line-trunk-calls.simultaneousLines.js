angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.calls.simultaneousLinesTrunk", {
        url: "/simultaneousLinesTrunk",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/calls/simultaneousLines/trunk/telecom-telephony-line-trunk-calls-simultaneousLines.html",
                controller: "TelecomTelephonyLineTrunkSimultaneousLines",
                controllerAs: "TrunkRatesSimultaneousLinesCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/calls/simultaneousLines"]
    });
});
