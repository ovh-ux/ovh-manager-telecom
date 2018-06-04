angular.module('managerApp').controller('XdslAccessIpOrderCtrl', ['$translate', '$uibModalInstance', 'data', 'OvhApiXdslIps', 'Toast', 'ToastError', 'URLS', function ($translate, $uibModalInstance, data, OvhApiXdslIps, Toast, ToastError, URLS) {
  const self = this;
  const ipRange = 29;

  this.constants = {
    xdslId: data.xdslId,
    price: '',
    amountIpOrdered: 8,
    contractUrl: URLS.ipOrderContract,
    hoursBeforeActivation: 1,
    hoursBeforeCollected: 48,
    engagementMinimumMonths: 1,
  };

  this.checkbox = {
    userAcceptImmediateExecution: false,
    userAcceptModalities: false,
  };

  this.init = function () {
    self.loading = true;
    OvhApiXdslIps.v6().price({
      ipRange,
    }, null).$promise.then((result) => {
      self.constants.price = result.text;
    }, (err) => {
      ToastError(err);
      $uibModalInstance.dismiss('error');
    }).finally(() => {
      self.loading = false;
    });
  };

  this.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  this.confirm = function () {
    self.loading = true;
    OvhApiXdslIps.v6().order({
      xdslId: self.constants.xdslId,
    }, null).$promise.then((result) => {
      Toast.success($translate.instant('pack_xdsl_access_ip_order_validation'));
      $uibModalInstance.close(result);
    }, ToastError).finally(() => {
      self.loading = false;
    });
  };

  this.init();
}]);
