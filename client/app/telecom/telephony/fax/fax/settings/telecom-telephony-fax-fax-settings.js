angular.module("managerApp").config(function ($stateProvider) {
    "use strict";

    $stateProvider.state("telecom.telephony.fax.fax.settings", {
        url: "/settings",
        views: {
            "@telephonyView": {
                templateUrl: "app/telecom/telephony/fax/fax/settings/telecom-telephony-fax-fax-settings.html",
                noTranslations: true
            },
            "@faxSettingsView": {
                templateUrl: "app/telecom/telephony/service/fax/settings/telecom-telephony-service-fax-settings.html",
                controller: "TelecomTelephonyServiceFaxSettingsCtrl",
                controllerAs: "SettingsCtrl"
            }
        },
        translations: ["common"]
    });
});
