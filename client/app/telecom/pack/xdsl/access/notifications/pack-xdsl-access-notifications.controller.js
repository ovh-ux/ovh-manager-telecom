angular.module("managerApp").controller("XdslAccessNotificationCtrl", function ($stateParams, ToastError) {
    "use strict";

    this.xdslId = $stateParams.serviceName;
    this.displayError = ToastError;
});
