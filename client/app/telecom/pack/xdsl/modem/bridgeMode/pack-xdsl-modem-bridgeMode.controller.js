angular.module('managerApp').controller('XdslModemBridgeModeCtrl', function ($stateParams, $q, $translate, OvhApiXdsl, Toast, PackXdslModemMediator) {
  const self = this;

  this.mediator = PackXdslModemMediator;

  this.undo = function () {
    _.set(PackXdslModemMediator, 'info.isBridged', !this.isBridged);
  };

  this.changeBridgeMode = function () {
    if (_.isEmpty($stateParams.serviceName)) {
      return Toast.error($translate.instant('xdsl_modem_bridge_mode_an_error_ocurred'));
    }
    PackXdslModemMediator.setTask('changeModemConfigBridgeMode');
    OvhApiXdsl.Modem().v6().update(
      {
        xdslId: $stateParams.serviceName,
      },
      {
        isBridged: self.isBridged,
      },
    ).$promise.then((data) => {
      PackXdslModemMediator.disableCapabilities();
      PackXdslModemMediator.setTask('changeModemConfigBridgeMode');
      if (self.isBridged) {
        Toast.success($translate.instant('xdsl_modem_bridge_mode_success_validation_on'));
      } else {
        Toast.success($translate.instant('xdsl_modem_bridge_mode_success_validation_off'));
      }
      return data;
    }).catch((err) => {
      self.undo();
      Toast.error($translate.instant('xdsl_modem_bridge_mode_an_error_ocurred'));
      return $q.reject(err);
    });
    return $q.when(null);
  };

  function init() {
    self.isBridged = PackXdslModemMediator.info.isBridged;
  }

  init();
});
