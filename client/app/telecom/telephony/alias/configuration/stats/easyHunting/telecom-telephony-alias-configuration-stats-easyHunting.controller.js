angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationStatsEasyHuntingCtrl", function (Telephony) {
    "use strict";

    var self = this;

    function init () {
        self.apiEndpoint = Telephony.EasyHunting();
    }

    init();
});
