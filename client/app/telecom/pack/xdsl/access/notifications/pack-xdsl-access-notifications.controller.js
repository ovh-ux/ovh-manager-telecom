angular.module('managerApp').controller('XdslAccessNotificationCtrl', function ($stateParams, ToastError) {
  this.xdslId = $stateParams.serviceName;
  this.displayError = ToastError;
});
