angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax", {
        url: "/fax/:serviceName",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/telecom-telephony-fax.html",
                controller: "TelecomTelephonyFaxCtrl",
                controllerAs: "FaxCtrl"
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
