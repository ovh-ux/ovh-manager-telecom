angular.module("managerApp").controller("OverTheBoxConfigureCtrl", function ($translate, $state, OverTheBox, Toast, ToastError) {
    "use strict";

    var self = this;

    this.orderHash = $state.href("order-overTheBox");

    function init () {
        self.loading = true;
        return OverTheBox.Lexi().getServices().$promise.then(function (services) {
            self.services = services;
            if (services.length === 0) {
                $state.go("order-overTheBox");
            }
            return services;
        }, function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    init();

});
