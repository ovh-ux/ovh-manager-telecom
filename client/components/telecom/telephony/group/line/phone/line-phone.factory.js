angular.module("managerApp").factory("TelephonyGroupLinePhone", function ($q, OvhApiTelephony, TelephonyGroupLinePhoneFunction, TelephonyGroupLinePhoneConfiguration) {
    "use strict";

    var mandatoriesPhoneOptions = [
        "billingAccount",
        "serviceName"
    ];
    var mandatoryNb;

    /*= ==================================
        =            CONSTRUCTOR            =
        ===================================*/

    function TelephonyGroupLinePhone (mandatoryOptions, phoneOptionsParam) {
        var phoneOptions = phoneOptionsParam;

        mandatoryNb = mandatoriesPhoneOptions.length;
        if (!mandatoryOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupLinePhone");
        } else {
            for (mandatoryNb; mandatoryNb--;) {
                if (!mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]]) {
                    // check mandatory attributes
                    throw new Error(mandatoriesPhoneOptions[mandatoryNb] + " option must be specified when creating a new TelephonyGroupLinePhone");
                } else {
                    // set mandatory attributes
                    this[mandatoriesPhoneOptions[mandatoryNb]] = mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]];
                }
            }
        }

        if (!phoneOptions) {
            phoneOptions = {};
        }

        this.protocol = null;
        this.macAddress = null;
        this.brand = null;
        this.ip = null;
        this.sip = null;
        this.options = null;
        this.configurations = [];

        this.setPhoneInfos(phoneOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
        =            PROTOTYPE METHODS            =
        =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupLinePhone.prototype.getFormattedMacAddress = function () {
        var self = this;

        return self.macAddress !== "" ? self.macAddress.match(/.{2}/g).join(":") : "";
    };

    TelephonyGroupLinePhone.prototype.setPhoneInfos = function (phoneOptions) {
        var self = this;

        angular.forEach(_.keys(phoneOptions), function (phoneOptionsKey) {
            if (phoneOptionsKey === "phoneConfiguration") {
                self.setConfigurations(phoneOptions[phoneOptionsKey]);
            } else if (phoneOptionsKey.indexOf("$") !== 0) {
                self[phoneOptionsKey] = phoneOptions[phoneOptionsKey];
            }
        });

        return self;
    };

    TelephonyGroupLinePhone.prototype.getPhone = function () {
        var self = this;

        return OvhApiTelephony.Line().Phone().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (phoneOptions) {
            return phoneOptions;
        }, function () {
            return null;
        });
    };

    TelephonyGroupLinePhone.prototype.getSip = function () {
        var self = this;

        return OvhApiTelephony.Line().Options().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (options) {
            return {
                user: self.serviceName,
                authorizeUser: self.serviceName,
                domains: options.domain,
                localIp: null,
                publicIp: null
            };
        }, function () {
            return null;
        });
    };

    TelephonyGroupLinePhone.prototype.getIps = function () {
        var self = this;

        return OvhApiTelephony.Line().v6().ips({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (ips) {
            if (ips.length) {
                return ips[ips.length - 1];
            }
            return null;
        }, function () {
            return null;
        });
    };

    TelephonyGroupLinePhone.prototype.getRMAs = function () {
        var self = this;

        return OvhApiTelephony.Line().Phone().RMA().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (RMAs) {
            var RMADetailsRequests = [];
            angular.forEach(RMAs, function (RMAId) {
                RMADetailsRequests.push(
                    OvhApiTelephony.Line().Phone().RMA().v6().get({
                        billingAccount: self.billingAccount,
                        serviceName: self.serviceName,
                        id: RMAId
                    }).$promise.then(function (RMADetails) {
                        return RMADetails;
                    }, function () {
                        return null;
                    })
                );
            });
            return $q.all(RMADetailsRequests);
        }, function () {
            return null;
        });
    };

    TelephonyGroupLinePhone.prototype.resetConfig = function (ip) {
        var self = this;

        return OvhApiTelephony.Line().Phone().v6().resetConfig({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            ip: ip
        }).$promise;
    };

    TelephonyGroupLinePhone.prototype.hasPhone = function () {
        var self = this;
        return self.macAddress && self.brand;
    };

    TelephonyGroupLinePhone.prototype.getFunctionKeys = function () {
        var self = this;

        if (self.hasPhone()) {
            return new TelephonyGroupLinePhoneFunction({
                serviceName: self.serviceName,
                billingAccount: self.billingAccount
            }).getFunctions().then(function (functionKeys) {
                var buildFunctionKeys = [];
                angular.forEach(functionKeys, function (key) {
                    buildFunctionKeys.push(new TelephonyGroupLinePhoneFunction({
                        serviceName: self.serviceName,
                        billingAccount: self.billingAccount
                    }, key));
                });
                return buildFunctionKeys;
            });
        }
        return $q.reject([]);

    };

    /* ----------  CONFIGURATIONS  ----------*/

    TelephonyGroupLinePhone.prototype.setConfigurations = function (configurationOptions) {
        var self = this;

        angular.forEach(configurationOptions, function (options) {
            self.configurations.push(new TelephonyGroupLinePhoneConfiguration(options));
        });

        return self;
    };

    TelephonyGroupLinePhone.prototype.changePhoneConfiguration = function (configsToSaveParam, refreshPhone, reboot) {
        var self = this;
        var configsToSave = configsToSaveParam;

        if (!configsToSave) {
            configsToSave = _.filter(self.configurations, function (config) {
                return !_.isEqual(config.value, config.prevValue);
            });
        }

        return OvhApiTelephony.Line().Phone().v6().changePhoneConfiguration({
            serviceName: self.serviceName,
            billingAccount: self.billingAccount
        }, {
            newConfigurations: _.map(configsToSave, function (config) {
                return {
                    key: config.name,
                    value: config.value.toString()
                };
            }),
            autoReboot: reboot
        }).$promise.then(function () {
            if (refreshPhone) {
                return self.getPhone().then(function (phoneOptions) {
                    self.configurations = [];
                    return self.setConfigurations(phoneOptions.phoneConfiguration);
                });
            }
            return self;

        });
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupLinePhone.prototype.initDeffered = function () {
        var self = this;

        return $q.all([
            self.getSip().then(function (sip) { return self.setPhoneInfos({ sip: sip }); }),
            self.getIps().then(function (ip) { return self.setPhoneInfos({ ip: ip }); })
        ]).then(function () {
            return self.getFunctionKeys().then(function (functionKey) {
                return self.setPhoneInfos({ functionKeys: functionKey });
            }, function () {
                return self.setPhoneInfos({ functionKeys: [] });
            }).then(function () {
                return self;
            });
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupLinePhone;
}
);
