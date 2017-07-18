angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.management.informations", {
        url: "/informations",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/management/informations/telecom-telephony-fax-management-informations.html",
                controller: "TelecomTelephonyFaxManagementInformationsCtrl",
                controllerAs: "$ctrl"
            }
        },
        translations: ["common", "telecom/telephony/fax"],
        resolve: {
            $title: function (translations, $translate, $stateParams) {
                return $translate("telephony_fax_page_title", { name: $stateParams.serviceName });
            }
        }
    });
});
