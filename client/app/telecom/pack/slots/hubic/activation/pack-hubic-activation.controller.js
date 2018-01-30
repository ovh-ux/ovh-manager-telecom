angular.module("managerApp").controller("PackHubicActivationCtrl", function ($scope, $stateParams, OvhApiPackXdslHubic, ToastError) {
    "use strict";

    this.$onInit = function () {
        self.hubicList = [];
        return OvhApiPackXdslHubic.Aapi().query({
            packId: $stateParams.packName
        }).$promise.then((data) => {
            this.hubicList = data;
        }).catch((err) => {
            ToastError(err);
        });
    };
});
