angular.module("managerApp").controller("XdslAccessIpv6Ctrl", function ($stateParams, $scope, $translate, OvhApiXdslIps, Toast, ToastError) {
    "use strict";
    this.submitIp = function () {
        if (_.isEmpty($stateParams.serviceName)) {
            Toast.error($translate.instant("xdsl_access_ipv6_an_error_ocurred"));
        }

        OvhApiXdslIps.v6().setIpv6(
            { xdslId: $stateParams.serviceName },
            { enabled: $scope.access.xdsl.ipv6Enabled },
            function (result) {
                if (result.status === "todo" || result.status === "doing") {
                    $scope.access.tasks.current[result.function] = true;
                }
                if ($scope.access.xdsl.ipv6Enabled) {
                    Toast.success($translate.instant("xdsl_access_ipv6_success_validation_on"));
                } else {
                    Toast.success($translate.instant("xdsl_access_ipv6_success_validation_off"));
                }
            },
            function (err) {
                $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
                return new ToastError(err, "xdsl_access_ipv6_an_error_ocurred");
            }
        );
    };

    this.undo = function () {
        $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
    };

    function init () {
        // if task in progress -> it means that ipv6Enabled is going to change
        if ($scope.access.tasks.current.routingIpv6) {
            $scope.access.xdsl.ipv6Enabled = !$scope.access.xdsl.ipv6Enabled;
        }
    }

    init();
});
