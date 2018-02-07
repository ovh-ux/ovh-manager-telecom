angular.module("managerApp").controller("PackHubicActivationCtrl", function ($scope, $stateParams, OvhApiPackXdslHubic, ToastError) {
    "use strict";

    var self = this;
    self.hubicList = [];

    self.$onInit = function () {
        return OvhApiPackXdslHubic.Aapi().query({ packId: $stateParams.packName }).$promise.then(
            function (data) {
                self.hubicList = data;
            },
            function (err) {
                return new ToastError(err);
            });
    };
});
