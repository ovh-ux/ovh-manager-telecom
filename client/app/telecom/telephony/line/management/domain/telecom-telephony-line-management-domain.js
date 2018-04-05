angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.domain", {
        url: "/domain",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/management/domain/telecom-telephony-line-management-domain.html",
                controller: "TelecomTelephonyLineDomainCtrl",
                controllerAs: "DomainCtrl"
            }
        },
        translations: ["common", "telecom/telephony/line/management/domain"]
    });
});
