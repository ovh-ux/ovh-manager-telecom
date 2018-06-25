angular.module('managerApp').controller('ovhTaskFollowModalCtrl', function ($scope, $uibModalInstance) {
  const self = this;

  self.isOpenState = {};
  self.tasks = null;

  /*= =============================
    =            EVENTS            =
    ============================== */

  self.cancel = function () {
    $uibModalInstance.dismiss();
  };

  /* -----  End of EVENTS  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.$onInit = function () {
    self.data = $scope.$parent.$ctrl.data;
  };

  /* -----  End of INITIALIZATION  ------*/
});
