angular.module("managerApp").controller("XdslAccessPortResetCtrl", function ($stateParams, $scope, $translate, OvhApiXdslLinesDslamPort, Toast, ToastError) {
    "use strict";

    this.resetDslam = function () {
        if (_.isEmpty($stateParams.serviceName) || _.isEmpty($stateParams.number)) {
            Toast.error($translate.instant("xdsl_access_dslam_reset_an_error_ocurred"));
        }

        OvhApiXdslLinesDslamPort.v6().reset(
            {
                xdslId: $stateParams.serviceName,
                number: $stateParams.number
            },
            null,
            function (result) {
                if (result.status === "todo" || result.status === "doing") {
                    $scope.access.tasks.current[result.function] = true;
                }

                Toast.success($translate.instant("xdsl_access_dslam_reset_success"));
            },
            function (err) {
                return new ToastError(err, "xdsl_access_dslam_reset_an_error_ocurred");
            }
        );
    };
});
