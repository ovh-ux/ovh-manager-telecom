angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.management.informations", {
        url: "/informations",
        views: {
            "faxView@telecom.telephony.fax": {
                templateUrl: "app/telecom/telephony/fax/management/informations/telecom-telephony-fax-management-informations.html",
                controller: "TelecomTelephonyFaxManagementInformationsCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: [
            "common",
            "telecom/telephony/fax",
            "telecom/telephony/fax/management/informations"
        ]
    });
});
