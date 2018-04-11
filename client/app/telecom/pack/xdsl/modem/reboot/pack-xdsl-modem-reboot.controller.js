angular.module("managerApp").controller("XdslModemRebootCtrl", function ($stateParams, $scope, $translate, $q, OvhApiXdsl, PackXdslModemMediator, Toast) {
    "use strict";

    this.mediator = PackXdslModemMediator;

    this.rebootModem = function () {
        if (_.isEmpty($stateParams.serviceName)) {
            return Toast.error($translate.instant("xdsl_modem_reboot_an_error_ocurred"));
        }
        PackXdslModemMediator.setTask("rebootModem");
        OvhApiXdsl.Modem().Reboot().v6().save(
            {
                xdslId: $stateParams.serviceName
            },
            null
        ).$promise.then(function (result) {
            if (result.status === "todo" || result.status === "doing") {
                PackXdslModemMediator.setTask("rebootModem");
            }
            PackXdslModemMediator.disableCapabilities();
            Toast.success($translate.instant("xdsl_modem_reboot_success"));
            return result;
        }).catch(function (err) {
            Toast.error($translate.instant("xdsl_modem_reboot_an_error_ocurred"));
            return $q.reject(err);
        });
        return $q.when(null);
    };

    var init = function () {
        $scope.$on("pack_xdsl_modem_task_rebootModem", function (event, state) {
            if (!state) {
                Toast.success($translate.instant("xdsl_modem_reboot_success_end"));
            }
        });
    };

    init();
});
