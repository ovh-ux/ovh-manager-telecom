angular.module('managerApp').controller('XdslModemRebootCtrl', function ($stateParams, $scope, $translate, $q, OvhApiXdsl, PackXdslModemMediator, TucToast) {
  this.mediator = PackXdslModemMediator;

  this.rebootModem = function () {
    if (_.isEmpty($stateParams.serviceName)) {
      return TucToast.error($translate.instant('xdsl_modem_reboot_an_error_ocurred'));
    }
    PackXdslModemMediator.setTask('rebootModem');
    OvhApiXdsl.Modem().Reboot().v6().save(
      {
        xdslId: $stateParams.serviceName,
      },
      null,
    ).$promise.then((result) => {
      if (result.status === 'todo' || result.status === 'doing') {
        PackXdslModemMediator.setTask('rebootModem');
      }
      PackXdslModemMediator.disableCapabilities();
      TucToast.success($translate.instant('xdsl_modem_reboot_success'));
      return result;
    }).catch((err) => {
      TucToast.error($translate.instant('xdsl_modem_reboot_an_error_ocurred'));
      return $q.reject(err);
    });
    return $q.when(null);
  };

  const init = function () {
    $scope.$on('pack_xdsl_modem_task_rebootModem', (event, state) => {
      if (!state) {
        TucToast.success($translate.instant('xdsl_modem_reboot_success_end'));
      }
    });
  };

  init();
});
