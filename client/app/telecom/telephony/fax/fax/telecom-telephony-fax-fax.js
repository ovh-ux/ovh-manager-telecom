angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.fax", {
        url: "/fax",
        views: {
            faxInnerView: {
                templateUrl: "app/telecom/telephony/fax/fax/telecom-telephony-fax-fax.html",
                controller: "TelecomTelephonyFaxFaxCtrl",
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
