angular.module("managerApp").controller("XdslModemResetCtrl", function ($stateParams, $scope, $translate, $q, Xdsl, Toast, PackXdslModemMediator) {
    "use strict";

    this.mediator = PackXdslModemMediator;

    this.resetModem = function () {
        if (_.isEmpty($stateParams.serviceName)) {
            return Toast.error($translate.instant("xdsl_modem_reset_an_error_ocurred"));
        }
        PackXdslModemMediator.setTask("resetModem");
        Xdsl.Modem().Reset().Lexi().save(
            {
                xdslId: $stateParams.serviceName
            },
            null
        ).$promise.then(function (result) {
            if (result.status === "todo" || result.status === "doing") {
                PackXdslModemMediator.setTask("resetModem");
            }
            PackXdslModemMediator.disableCapabilities();
            Toast.success($translate.instant("xdsl_modem_reset_success"));
            return result;
        }).catch(function (err) {
            Toast.error($translate.instant("xdsl_modem_reset_an_error_ocurred"));
            return $q.reject(err);
        });
        return $q.when(null);
    };

    var init = function () {
        $scope.$on("pack_xdsl_modem_task_resetModem", function (event, state) {
            if (!state) {
                Toast.success($translate.instant("xdsl_modem_reset_success_end"));
            }
        });
    };

    init();
});
