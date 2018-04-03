angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.fax.campaigns", {
        url: "/campaigns",
        views: {
            "lineView@telecom.telephony.line": {
                templateUrl: "app/telecom/telephony/line/fax/campaigns/telecom-telephony-line-fax-campaigns.html",
                noTranslations: true
            },
            "faxCampaignsView@telecom.telephony.line.fax.campaigns": {
                templateUrl: "app/telecom/telephony/service/fax/campaigns/telecom-telephony-service-fax-campaigns.html",
                controller: "TelecomTelephonyServiceFaxCampaignsCtrl",
                controllerAs: "CampaignsCtrl"
            }
        },
        translations: ["common"]
    });
});
