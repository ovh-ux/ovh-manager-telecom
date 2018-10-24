angular.module('managerApp').controller('XdslModemResetCtrl', function ($stateParams, $scope, $translate, $q, OvhApiXdsl, Toast, TucPackXdslModemMediator) {
  this.mediator = TucPackXdslModemMediator;

  this.resetModem = function (resetOvhConfig) {
    if (_.isEmpty($stateParams.serviceName)) {
      return Toast.error($translate.instant('xdsl_modem_reset_an_error_ocurred'));
    }
    TucPackXdslModemMediator.setTask('resetModem');
    OvhApiXdsl.Modem().Reset().v6().save({
      xdslId: $stateParams.serviceName,
      resetOvhConfig: resetOvhConfig ? 1 : 0,
    }, null).$promise.then((result) => {
      if (result.status === 'todo' || result.status === 'doing') {
        TucPackXdslModemMediator.setTask('resetModem');
      }
      TucPackXdslModemMediator.disableCapabilities();
      Toast.success($translate.instant(resetOvhConfig
        ? 'xdsl_modem_reset_ovh_config_success'
        : 'xdsl_modem_reset_success'));
      return result;
    }).catch((err) => {
      Toast.error($translate.instant(resetOvhConfig
        ? 'xdsl_modem_reset_ovh_config_an_error_ocurred'
        : 'xdsl_modem_reset_an_error_ocurred'));
      return $q.reject(err);
    });
    return $q.when(null);
  };

  const init = function () {
    $scope.$on('pack_xdsl_modem_task_resetModem', (event, state) => {
      if (!state) {
        Toast.success($translate.instant('xdsl_modem_reset_success_end'));
      }
    });
  };

  init();
});
