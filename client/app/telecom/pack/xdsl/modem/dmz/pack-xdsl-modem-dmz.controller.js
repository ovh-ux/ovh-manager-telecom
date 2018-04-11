angular.module("managerApp").controller("XdslModemDmzCtrl", function ($stateParams, $translate, $q, OvhApiXdsl, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;

    this.editing = false;
    this.validator = validator;
    this.mediator = PackXdslModemMediator;

    this.cancel = function () {
        this.editing = false;
    };

    this.changeDmz = function () {
        this.editing = false;
        var validIp = validator.isIP(self.dmz) || self.dmz === null;
        if (_.isEmpty($stateParams.serviceName) || !PackXdslModemMediator.capabilities.canChangeDMZ || !validIp) {
            Toast.error($translate.instant("xdsl_modem_dmz_an_error_ocurred"));
            return $q.reject();
        }
        return OvhApiXdsl.Modem().v6().update(
            {
                xdslId: $stateParams.serviceName
            },
            {
                dmzIP: self.dmz
            }
        ).$promise.then(
            function (data) {
                PackXdslModemMediator.disableCapabilities();
                PackXdslModemMediator.setTask("changeModemConfigDMZ");
                PackXdslModemMediator.info.dmzIP = self.dmz;
                Toast.success($translate.instant("xdsl_modem_dmz_doing"));
                return data;
            }
        ).catch(
            function (err) {
                Toast.error($translate.instant("xdsl_modem_dmz_an_error_ocurred"));
                return $q.reject(err);
            }
        );
    };

    this.setEditMode = function () {
        this.editing = true;
        this.dmz = PackXdslModemMediator.info.dmzIP;
    };

    this.delete = function () {
        this.dmz = null;
        this.changeDmz();
    };

    var init = function () {
        return OvhApiXdsl.Modem().Lan().Aapi().getLanDetails(
            {
                xdslId: $stateParams.serviceName
            }
        ).$promise.then(
            function (data) {
                self.modemLan = _.find(data, { lanName: "defaultLAN" });
                return data;
            }
        ).catch(
            function (err) {
                Toast.error($translate.instant("xdsl_modem_dmz_an_error_ocurred"));
                return $q.reject(err);
            }
        );
    };

    init();
});
