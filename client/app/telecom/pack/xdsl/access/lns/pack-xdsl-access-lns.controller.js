angular.module("managerApp").controller("XdslAccessLnsCtrl", function ($stateParams, $scope, $translate, Xdsl, Toast, ToastError) {
    "use strict";

    var self = this;

    this.changeLns = function () {
        if (_.isEmpty($stateParams.serviceName) || !self.currentLnsTmp) {
            Toast.error($translate.instant("xdsl_access_lns_an_error_ocurred"));
        }

        Xdsl.Lexi().changeLns(
            { xdslId: $stateParams.serviceName },
            { lnsName: self.currentLnsTmp.name },
            function (result) {
                self.currentLns = self.currentLnsTmp;

                if (result.status === "todo" || result.status === "doing") {
                    $scope.access.tasks.current[result.function] = true;
                }

                Toast.success($translate.instant("xdsl_access_lns_doing"));

            }, function (err) {
                return new ToastError(err, "xdsl_access_lns_an_error_ocurred");
            });
    };

    function init () {
        self.lns = $scope.access.xdsl.lns;
        self.currentLnsTmp = _.find(self.lns, "isCurrent");
        self.currentLns = self.currentLnsTmp;
    }
    init();
});
