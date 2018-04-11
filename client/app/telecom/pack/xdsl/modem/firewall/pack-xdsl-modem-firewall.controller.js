angular.module("managerApp").controller("XdslModemFirewallCtrl", function ($stateParams, $translate, $q, OvhApiXdsl, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;

    this.mediator = PackXdslModemMediator;

    this.changeFirewallLevel = function () {
        if (_.isEmpty($stateParams.serviceName) || !this.firewallCurrentLevelTmp || !PackXdslModemMediator.capabilities.canChangeEasyFirewallLevel) {
            this.firewallCurrentLevelTmp = this.firewallCurrentLevel;
            Toast.error($translate.instant("xdsl_modem_firewall_an_error_ocurred"));
            return $q.reject();
        }
        return OvhApiXdsl.Modem().v6().update(
            {
                xdslId: $stateParams.serviceName
            },
            {
                easyFirewallLevel: this.firewallCurrentLevelTmp.name
            }
        ).$promise.then(function (data) {
            PackXdslModemMediator.disableCapabilities();
            PackXdslModemMediator.setTask("changeModemConfigEasyFirewallLevel");
            self.firewallCurrentLevel = self.firewallCurrentLevelTmp;
            Toast.success($translate.instant("xdsl_modem_firewall_doing"));
            return data;
        }).catch(function (err) {
            self.firewallCurrentLevelTmp = self.firewallCurrentLevel;
            Toast.error($translate.instant("xdsl_modem_firewall_an_error_ocurred"));
            return $q.reject(err);
        });

    };

    this.getDisplayValue = function () {
        return PackXdslModemMediator.info.easyFirewallLevel ? PackXdslModemMediator.info.easyFirewallLevel : "Normal";
    };

    var init = function () {
        self.firewallLevels = [
            {
                name: "BlockAll",
                label: "xdsl_modem_firewall_level_blockall"
            },
            {
                name: "Disabled",
                label: "xdsl_modem_firewall_level_disabled"
            },
            {
                name: "Normal",
                label: "xdsl_modem_firewall_level_normal"
            }
        ];
        self.firewallCurrentLevel = _.find(self.firewallLevels, { name: self.getDisplayValue() });
        self.firewallCurrentLevelTmp = self.firewallCurrentLevel;
    };

    init();

});
