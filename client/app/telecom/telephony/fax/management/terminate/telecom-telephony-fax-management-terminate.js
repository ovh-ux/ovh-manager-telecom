angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.management.terminate", {
        url: "/terminate",
        views: {
            "@faxView": {
                templateUrl: "app/telecom/telephony/fax/management/terminate/telecom-telephony-fax-management-terminate.html",
                controller: "TelecomTelephonyFaxManagementTerminateCtrl",
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
