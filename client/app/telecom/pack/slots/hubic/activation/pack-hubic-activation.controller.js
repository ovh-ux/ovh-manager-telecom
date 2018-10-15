angular.module('managerApp').controller('PackHubicActivationCtrl', function ($scope, $stateParams, OvhApiPackXdslHubic, ToastError) {
  const self = this;
  self.hubicList = [];

  self.$onInit = function () {
    return OvhApiPackXdslHubic.Aapi().query({ packId: $stateParams.packName }).$promise.then(
      (data) => {
        self.hubicList = data;
      },
      err => new ToastError(err),
    );
  };
});
