angular.module("managerApp").component("telecomTelephonyAssociateDevice", {
    bindings: {
        billingAccount: "<",
        serviceName: "<",
        macAddress: "="
    },
    templateUrl: "components/telecom/telephony/associateDevice/telecom-telephony-associate-device.html",
    controller: function ($scope, $state, $q, $translatePartialLoader, $translate, OvhApiTelephony, TelephonyMediator, ToastError) {
        "use strict";

        var self = this;

        self.$onInit = function () {
            self.isInitialized = false;
            self.selectedMac = null;
            self.ipAddress = null;
            self.attachSuccess = false;
            $scope.$watch("$ctrl.selectedMac", function (mac) {
                var phone = self.findPhoneByMac(mac);
                self.ipAddress = phone ? phone.ip : null;
            });
            $translatePartialLoader.addPart("../components/telecom/telephony/associateDevice");
            return $translate.refresh().then(self.fetchAssociablesPhones).then(function (phones) {
                self.phones = phones;
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.isInitialized = true;
            });
        };

        self.fetchAssociablesPhones = function () {
            return OvhApiTelephony.Line().v6().listAssociablePhones({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }).$promise.then(function (phones) {
                return $q.all(_.map(phones, function (phone) {
                    var line = _.first(phone.associatedLines).serviceName;
                    return OvhApiTelephony.Line().Phone().v6().get({
                        billingAccount: self.billingAccount,
                        serviceName: line
                    }).$promise.then(function (details) {
                        return _.assign(phone, details);
                    }).then(function (thePhone) {
                        return OvhApiTelephony.Line().v6().ips({
                            billingAccount: self.billingAccount,
                            serviceName: line
                        }).$promise.then(function (ips) {
                            if (ips.length) {
                                thePhone.ip = _.first(ips).ip;
                            }
                            return thePhone;
                        });
                    });
                }));
            });
        };

        self.findPhoneByMac = function (mac) {
            return _.find(self.phones, { macAddress: mac });
        };

        self.attachDevice = function () {
            self.isAttaching = true;
            return OvhApiTelephony.Line().v6().associateDevice({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }, {
                ipAddress: self.ipAddress,
                macAddress: self.macAdress
            }).$promise.then(function () {
                self.attachSuccess = true;

                // Refresh cache and state
                OvhApiTelephony.Line().v6().resetAllCache();
                TelephonyMediator.resetAllCache();
                $state.reload();
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.isAttaching = false;
            });
        };
    }
});
