angular.module("managerApp").controller("XdslModemMtuCtrl", function ($stateParams, $q, OvhApiXdsl, $translate, Toast, PackXdslModemMediator, PACK_XDSL_MODEM) {
    "use strict";

    var self = this;

    this.mediator = PackXdslModemMediator;

    this.undo = function () {
        self.mtuCurrentValueTmp = self.mtuCurrentValue;
    };

    this.changeMtuSize = function () {
        if (_.isEmpty($stateParams.serviceName) || !self.mtuCurrentValueTmp || !PackXdslModemMediator.capabilities.canChangeMtu) {
            self.undo();
            Toast.error($translate.instant("xdsl_modem_mtu_an_error_ocurred"));
            return $q.reject();
        }
        PackXdslModemMediator.setTask("changeMTU");
        this.loading = true;
        return OvhApiXdsl.Modem().v6().update(
            {
                xdslId: $stateParams.serviceName
            },
            {
                mtuSize: self.mtuCurrentValueTmp.value
            }
        ).$promise.then(
            function () {
                PackXdslModemMediator.disableCapabilities();
                self.mtuCurrentValue = self.mtuCurrentValueTmp;
                PackXdslModemMediator.setTask("changeMTU");
                Toast.success($translate.instant("xdsl_modem_mtu_doing"));
            }
        ).catch(
            function (err) {
                self.undo();
                Toast.error("xdsl_modem_mtu_an_error_ocurred");
                return $q.reject(err);
            }
        ).finally(
            function () {
                self.loading = false;
            }
        );
    };

    this.getDisplayValue = function () {
        return PackXdslModemMediator.info.mtuSize ? PackXdslModemMediator.info.mtuSize : PACK_XDSL_MODEM.mtu.default;
    };

    var init = function () {
        self.mtuValues = PACK_XDSL_MODEM.mtu.values;
        self.mtuCurrentValue = _.find(self.mtuValues, { value: self.getDisplayValue() });
        self.undo();
    };

    init();
});
