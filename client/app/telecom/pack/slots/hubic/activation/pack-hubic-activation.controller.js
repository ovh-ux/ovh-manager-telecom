angular.module("managerApp").controller("PackHubicActivationCtrl", function ($scope, $stateParams, PackXdslHubic, ToastError) {
    "use strict";

    var self = this;

    this.init = function () {
        self.loading = true;
        self.hubicList = [];
        return PackXdslHubic.Aapi().query({ packId: $stateParams.packName }).$promise.then(
            function (data) {
                self.hubicList = data;
            },
            function (err) {
                return new ToastError(err);
            }
        ).finally(function () {
            self.loading = false;
        }
        );
    };

    this.init();
});
