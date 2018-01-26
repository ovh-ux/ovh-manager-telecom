angular.module("managerApp").controller("PackHubicActivationCtrl", function ($scope, $stateParams, OvhApiPackXdslHubic, ToastError) {
    "use strict";

    var self = this;

    this.$onInit = function () {
        self.loading = true;
        self.hubicList = [];
        return OvhApiPackXdslHubic.Aapi().query({ packId: $stateParams.packName }).$promise.then(
            function (data) {
                self.hubicList = data;
            },
            function (err) {
                return new ToastError(err);
            }
        ).finally(function () {
            self.loading = false;
        });
    };
});
