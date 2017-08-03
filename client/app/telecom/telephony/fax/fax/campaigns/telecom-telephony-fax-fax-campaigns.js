angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.fax.fax.campaigns", {
        url: "/campaigns",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/fax/campaigns/telecom-telephony-fax-fax-campaigns.html",
                noTranslations: true
            },
            "@faxCampaignsView": {
                templateUrl: "app/telecom/telephony/service/fax/campaigns/telecom-telephony-service-fax-campaigns.html",
                controller: "TelecomTelephonyServiceFaxCampaignsCtrl",
                controllerAs: "CampaignsCtrl"
            }
        },
        translations: ["common"]
    });
});
