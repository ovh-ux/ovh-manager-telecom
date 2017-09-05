angular.module("managerApp")
    .controller("XdslModemWifiConfigCtrl", function ($state, $q, $timeout, $stateParams, $translate, Toast, OvhApiXdsl, PackXdslModemMediator) {
        "use strict";

        var self = this;
        this.haveToTypeYourKey = false;
        this.mediator = PackXdslModemMediator;
        this.wifi = null;

        this.loaders = {
            wifi: true,
            completed: false
        };

        this.errors = {
            wifi: false
        };

        this.fields = {
            securityType: {},
            channelMode: _.flatten(["Auto", _.range(1, 14)])
        };

        var wifiFields = [
            "SSID",
            "SSIDAdvertisementEnabled",
            "channel",
            "channelMode",
            "enabled",
            "securityKey",
            "securityType"
        ];

        this.keyError = function () {
            if (!this.wifi || !this.wifi.key) {
                return false;
            }

            if (this.wifi.key.length > 0 && this.wifi.key === this.wifi.key2) {
                this.haveToTypeYourKey = false;
                return false;
            }

            return this.wifi.key !== this.wifi.key2;
        };

        this.resetKey = function () {
            if (this.wifi.securityType === "None") {
                this.wifi.key = "";
                this.wifi.key2 = "";
                this.haveToTypeYourKey = false;
            } else {
                this.haveToTypeYourKey = true;
            }
        };

        this.update = function () {
            if (!this.wifi) {
                return;
            }

            this.loaders.completed = true;

            var wifiTmp = {};

            wifiFields.forEach(function (field) {
                if (self.hasConfigFieldChanged(field)) {
                    _.set(wifiTmp, field, _.get(self.wifi, field));
                }
            });

            if (self.wifi.securityType !== "None" && self.wifi.key) {
                self.wifi.securityKey = self.wifi.key;
                wifiTmp.securityKey = self.wifi.securityKey;
            }

            OvhApiXdsl.Modem().Wifi().Lexi().update({
                xdslId: $stateParams.serviceName,
                wifiName: this.wifi.wifiName
            }, wifiTmp).$promise.then(function (data) {
                Toast.success($translate.instant(self.wifis.length > 1 ? "xdsl_modem_wifi_config_success" : "xdsl_modem_wifi_config_success_single"));

                if (self.wifis.length > 1) {
                    self.resetKey();

                    // replace wifi in list
                    self.wifis.splice(_.findIndex(self.wifis, {
                        wifiName: self.wifi.wifiName
                    }), 1, self.wifi);
                    self.wifi = null;
                } else {
                    $timeout(function () {
                        $state.go("telecom.pack.xdsl.modem");
                    }, 2000);
                }
                self.mediator.tasks.changeModemConfigWLAN = true;
                return data;
            }).catch(function (err) {
                Toast.error([$translate.instant("xdsl_modem_wifi_write_error"), _.get(err, "data.message")].join(" "));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.completed = false;
            });
        };

        self.cancelConfig = function () {
            if (self.wifis.length === 1) {
                $state.go("telecom.pack.xdsl.modem");
            } else {
                self.wifi = null;
            }
        };

        self.onChannelChange = function () {
            if (this.wifi.channelCustom !== "Auto") {
                this.wifi.channelMode = "Manual";
                this.wifi.channel = this.wifi.channelCustom;
            } else {
                this.wifi.channelMode = "Auto";
            }
        };

        self.hasConfigFieldChanged = function (field, originalWifi) {
            var original = originalWifi;
            if (!original) {
                original = _.find(self.wifis, {
                    wifiName: self.wifi.wifiName
                });
            }

            return !_.isEqual(_.get(original, field), _.get(self.wifi, field));
        };

        self.hasConfigChange = function () {
            var original = _.find(self.wifis, {
                wifiName: self.wifi.wifiName
            });

            return _.some(_.flatten([wifiFields, ["key", "key2"]]), function (field) {
                return self.hasConfigFieldChanged(field, original);
            });
        };

        /**
         *  Used to avoid refresh of name in section header title when editing
         */
        this.getWifiSsid = function () {
            return _.find(self.wifis, {
                wifiName: self.wifi.wifiName
            }).SSID;
        };

        self.setSelectedWifi = function (wifi) {
            self.wifi = angular.copy(wifi);
        };

        function init () {
            self.fields.securityType = ["None", "WEP", "WPA", "WPA2", "WPAandWPA2"];

            return OvhApiXdsl.Modem().Wifi().Aapi().getWifiDetails({
                xdslId: $stateParams.serviceName
            }).$promise.then(function (data) {
                self.wifis = _.map(data, function (wifi) {
                    wifi.channelCustom = wifi.channelMode === "Auto" ? "Auto" : wifi.channel;
                    return wifi;
                }).sort(function (wifiA) {
                    return wifiA.wifiName === "defaultWIFI" ? -1 : 1;
                });

                if (self.wifis.length === 1) {
                    self.setSelectedWifi(_.find(data, {
                        wifiName: "defaultWIFI"
                    }));
                }

                return data;
            }).catch(function (err) {
                Toast.error($translate.instant("xdsl_modem_wifi_read_error"));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.wifi = false;
            });
        }

        init();
    });
