angular.module("managerApp")
    .controller("XdslModemWifiConfigCtrl", function ($state, $q, $timeout, $stateParams, $translate, Toast, Xdsl, PackXdslModemMediator) {
        "use strict";

        var self = this;
        this.haveToTypeYourKey = false;
        this.mediator = PackXdslModemMediator;

        this.loaders = {
            wifi: true,
            completed: false
        };

        this.errors = {
            wifi: false
        };

        this.fields = {
            securityType: {},
            channelMode: _.range(1, 14)
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
            if (this.wifi.channelCustom !== "Auto") {
                this.wifi.channelMode = "Manual";
                this.wifi.channel = this.wifi.channelCustom;
            } else {
                this.wifi.channelMode = "Auto";
            }

            if (this.wifi.securityType !== "None" && (this.wifi.key || this.wifi.key2)) {
                if (this.keyError()) {
                    Toast.success($translate.instant("xdsl_modem_wifi_config_key_not_matching"));
                }

                this.wifi.securityKey = this.wifi.key;
            }

            var wifiTmp = _.pick(this.wifi, wifiFields);
            Xdsl.Modem().Wifi().Lexi().update(
                {
                    xdslId: $stateParams.serviceName,
                    wifiName: this.wifi.wifiName
                },
                wifiTmp
            ).$promise.then(
                function (data) {
                    Toast.success($translate.instant("xdsl_modem_wifi_config_success"));
                    $timeout(function () {
                        $state.go("telecom.pack.xdsl.modem");
                    }, 2000);
                    return data;
                }
            ).catch(function (err) {
                Toast.error($translate.instant("xdsl_modem_wifi_write_error"));
                return $q.reject(err);
            }).finally(function () {
                self.loaders.completed = false;
            });
        };

        function init () {
            if (!$stateParams.wifiName) {
                self.loaders.wifi = false;
                self.errors.wifi = true;
                return Toast.error($translate.instant("xdsl_modem_wifi_config_error_missing"));
            }

            self.fields.securityType = ["None", "WEP", "WPA", "WPA2", "WPAandWPA2"];

            if ($stateParams.wifi) {
                self.wifi = $stateParams.wifi;
                self.wifi.channelCustom = self.wifi.channelMode === "Auto" ? "Auto" : self.wifi.channel;
                self.loaders.wifi = false;
            } else {
                Xdsl.Modem().Wifi().Aapi().getWifiDetails(
                    {
                        xdslId: $stateParams.serviceName
                    }
                ).$promise.then(
                    function (data) {
                        self.wifi = _.find(data, {
                            wifiName: "defaultWIFI"
                        });
                        self.wifi.channelCustom = self.wifi.channelMode === "Auto" ? "Auto" : self.wifi.channel;
                        self.loaders.wifi = false;
                        return data;
                    }
                ).catch(function (err) {
                    Toast.error($translate.instant("xdsl_modem_wifi_read_error"));
                    return $q.reject(err);
                });
            }
            return $q.when(null);
        }

        init();
    });
