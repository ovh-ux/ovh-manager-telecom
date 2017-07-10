angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.linesGroup", {
        url: "/linesGroup",
        views: {
            groupView: {
                templateUrl: "app/telecom/telephony/billingAccount/administration/linesGroup/telecom-telephony-billing-account-administration-lines-group.html",
                controller: "TelecomTelephonyBillingAccountAdministrationLinesGroup",
                controllerAs: "LinesGroupCtrl"
            }
        },
        translations: ["common"]
    });
});
