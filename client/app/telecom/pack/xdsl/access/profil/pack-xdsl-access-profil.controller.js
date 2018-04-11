angular.module("managerApp").controller("XdslAccessProfileCtrl", function ($stateParams, $scope, $translate, OvhApiXdslLinesDslamPort, Toast, ToastError) {
    "use strict";

    var self = this;

    self.loader = true;

    this.changeProfile = function () {
        if (_.isEmpty($stateParams.serviceName) || !self.currentProfileTmp) {
            Toast.error($translate.instant("xdsl_access_dslam_an_error_ocurred"));
        }

        OvhApiXdslLinesDslamPort.v6().changeProfile(
            {
                xdslId: $stateParams.serviceName,
                number: $stateParams.number
            },
            { dslamProfileId: self.currentProfileTmp.id },
            function (result) {
                self.currentProfile = self.currentProfileTmp;

                if (result.status === "todo" || result.status === "doing") {
                    $scope.access.tasks.current[result.function] = true;
                }

                Toast.success($translate.instant("xdsl_access_profile_doing"));
            }, function (err) {
                return new ToastError(err, "xdsl_access_dslam_an_error_ocurred");
            });
    };

    function init () {
        OvhApiXdslLinesDslamPort.Aapi().getProfiles(
            {
                xdslId: $stateParams.serviceName,
                number: $stateParams.number
            },
            function (result) {
                self.loader = false;
                self.profiles = result;
                self.currentProfile = _.find(self.profiles, "isCurrent");
                self.currentProfileTmp = self.currentProfile;
            }, function (err) {
                self.loader = false;
                return new ToastError(err, "xdsl_access_dslam_an_error_ocurred");
            }
        );
    }
    init();
});
