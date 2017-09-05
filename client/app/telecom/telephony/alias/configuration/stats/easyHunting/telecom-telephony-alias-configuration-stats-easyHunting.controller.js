angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationStatsEasyHuntingCtrl", function (OvhApiTelephony) {
    "use strict";

    var self = this;

    function init () {
        self.apiEndpoint = OvhApiTelephony.EasyHunting();
    }

    init();
});
