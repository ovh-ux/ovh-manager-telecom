angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.consumption", {
        url: "/consumption",
        views: {
            lineInnerView: {
                templateUrl: "app/telecom/telephony/fax/consumption/telecom-telephony-fax-consumption.html"
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
