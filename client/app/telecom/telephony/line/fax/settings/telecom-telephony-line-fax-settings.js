angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom.telephony.line.fax.settings", {
        url: "/settings",
        views: {
            "@lineView": {
                templateUrl: "app/telecom/telephony/line/fax/settings/telecom-telephony-line-fax-settings.html",
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
