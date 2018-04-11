angular.module("managerApp").controller("XdslModemWifiCtrl", function ($stateParams, $translate, $q, OvhApiXdsl, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;
    this.loader = true;
    this.mediator = PackXdslModemMediator;

    self.wifis = null;
    self.defaultWifi = null;

    this.undo = function () {
        self.defaultWifi.enabled = self.undoData.enabled;
    };

    this.update = function () {
        if (_.isEmpty($stateParams.serviceName) || !PackXdslModemMediator.capabilities.canChangeWLAN) {
            Toast.error($translate.instant("xdsl_modem_firewall_an_error_ocurred"));
            return $q.reject();
        }
        this.loader = true;
        return OvhApiXdsl.Modem().Wifi().v6().update(
            {
                xdslId: $stateParams.serviceName,
                wifiName: self.defaultWifi.wifiName
            },
            {
                enabled: self.defaultWifi.enabled
            }).$promise.then(function (data) {
                PackXdslModemMediator.setTask("changeModemConfigWLAN");
                Toast.success($translate.instant(self.defaultWifi.enabled ? "xdsl_modem_wifi_success_validation_on" : "xdsl_modem_wifi_success_validation_off"));
                self.undoData.enabled = self.defaultWifi.enabled;
                return data;
            }).catch(function (err) {
                self.defaultWifi.enabled = self.undoData.enabled;
                Toast.error($translate.instant("xdsl_modem_wifi_update_error"));
                return $q.reject(err);
            }).finally(function () {
                self.loader = false;
            });
    };

    function initModemWifi () {
        self.loader = true;
        return OvhApiXdsl.Modem().Wifi().Aapi().getWifiDetails({
            xdslId: $stateParams.serviceName
        }).$promise.then(
            function (data) {
                self.wifis = data;

                self.defaultWifi = _.find(self.wifis, {
                    wifiName: "defaultWIFI"
                });
                self.undoData = {
                    enabled: self.defaultWifi ? self.defaultWifi.enabled : false
                };
                return data;
            }
        ).catch(
            function (err) {
                Toast.error($translate.instant("xdsl_modem_wifi_read_error"));
                return $q.reject(err);
            }
        ).finally(
            function () {
                self.loader = false;
            }
        );
    }

    initModemWifi();
});
