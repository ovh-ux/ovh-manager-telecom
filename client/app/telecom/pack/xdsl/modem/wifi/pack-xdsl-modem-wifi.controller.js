angular.module("managerApp").controller("XdslModemWifiCtrl", function ($stateParams, $translate, $q, OvhApiXdsl, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;
    this.loader = true;
    this.mediator = PackXdslModemMediator;

    this.undo = function () {
        self.wifi.enabled = self.undoData.enabled;
    };

    this.update = function () {
        if (_.isEmpty($stateParams.serviceName) || !PackXdslModemMediator.capabilities.canChangeWLAN) {
            Toast.error($translate.instant("xdsl_modem_firewall_an_error_ocurred"));
            return $q.reject();
        }
        this.loader = true;
        return OvhApiXdsl.Modem().Wifi().Lexi().update(
            {
                xdslId: $stateParams.serviceName,
                wifiName: self.wifi.wifiName
            },
            {
                enabled: self.wifi.enabled
            }).$promise.then(function (data) {
                PackXdslModemMediator.setTask("changeModemConfigWLAN");
                Toast.success($translate.instant(self.wifi.enabled ? "xdsl_modem_wifi_success_validation_on" : "xdsl_modem_wifi_success_validation_off"));
                self.undoData.enabled = self.wifi.enabled;
                return data;
            }).catch(function (err) {
                self.wifi.enabled = self.undoData.enabled;
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
                self.wifi = _.find(data, {
                    wifiName: "defaultWIFI"
                });
                self.undoData = {
                    enabled: self.wifi ? self.wifi.enabled : false
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
