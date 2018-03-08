angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.optionsGroup", {
        url: "/optionsGroup",
        views: {
            "groupView@telecom.telephony": {
                templateUrl: "app/telecom/telephony/billingAccount/administration/optionsGroup/telecom-telephony-billing-account-administration-options-group.html",
                controller: "TelecomTelephonyBillingAccountAdministrationOptionsGroup",
                controllerAs: "OptionsGroupCtrl"
            }
        },
        translations: ["common"]
    });
});
