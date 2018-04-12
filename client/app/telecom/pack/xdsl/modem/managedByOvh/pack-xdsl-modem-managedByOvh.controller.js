angular.module("managerApp").controller("XdslModemManagedByCtrl", function ($stateParams, $q, $translate, OvhApiXdsl, Toast, PackXdslModemMediator) {
    "use strict";

    var self = this;

    this.mediator = PackXdslModemMediator;

    this.undo = function () {
        PackXdslModemMediator.info.managedByOvh = !PackXdslModemMediator.info.managedByOvh;
        PackXdslModemMediator.unsetTask("changeModemConfigManagement");
    };

    this.tooltip = _.get(this.mediator, "info.managedByOvh") ?
        ["<strong class=\"text-warning\">", $translate.instant("xdsl_modem_managedBy_warning"), "</strong>"].join("") :
        ["<strong class=\"text-warning\">", $translate.instant("xdsl_modem_managedBy_warning_override"), "</strong>"].join("");

    this.changeManagedBy = function () {
        if (_.isEmpty($stateParams.serviceName)) {
            Toast.error($translate.instant("xdsl_modem_managedBy_an_error_ocurred"));
            return $q.reject();
        }
        this.updating = true;
        PackXdslModemMediator.setTask("changeModemConfigManagement");
        PackXdslModemMediator.disableCapabilities();
        return OvhApiXdsl.Modem().v6().update(
            {
                xdslId: $stateParams.serviceName
            },
            {
                managedByOvh: PackXdslModemMediator.info.managedByOvh
            }
        ).$promise.then(
            function (data) {
                if (PackXdslModemMediator.info.managedByOvh) {
                    Toast.success($translate.instant("xdsl_modem_managedBy_success_validation_on"));
                } else {
                    Toast.success($translate.instant("xdsl_modem_managedBy_success_validation_off"));
                }
                return data;
            }
        ).catch(
            function (err) {
                self.undo();
                Toast.error($translate.instant("xdsl_modem_managedBy_an_error_ocurred"));
                return $q.reject(err);
            }
        ).finally(
            function () {
                self.updating = false;
            }
        );
    };
});
