angular.module('managerApp').controller('XdslModemMtuCtrl', function ($stateParams, $q, OvhApiXdsl, $translate, Toast, TucPackXdslModemMediator, PACK_XDSL_MODEM) {
  const self = this;

  this.mediator = TucPackXdslModemMediator;

  this.undo = function () {
    self.mtuCurrentValueTmp = self.mtuCurrentValue;
  };

  this.changeMtuSize = function () {
    if (_.isEmpty($stateParams.serviceName)
      || !self.mtuCurrentValueTmp
      || !TucPackXdslModemMediator.capabilities.canChangeMtu) {
      self.undo();
      Toast.error($translate.instant('xdsl_modem_mtu_an_error_ocurred'));
      return $q.reject();
    }
    TucPackXdslModemMediator.setTask('changeMTU');
    this.loading = true;
    return OvhApiXdsl.Modem().v6().update(
      {
        xdslId: $stateParams.serviceName,
      },
      {
        mtuSize: self.mtuCurrentValueTmp.value,
      },
    ).$promise.then(() => {
      TucPackXdslModemMediator.disableCapabilities();
      self.mtuCurrentValue = self.mtuCurrentValueTmp;
      TucPackXdslModemMediator.setTask('changeMTU');
      Toast.success($translate.instant('xdsl_modem_mtu_doing'));
    }).catch((err) => {
      self.undo();
      Toast.error('xdsl_modem_mtu_an_error_ocurred');
      return $q.reject(err);
    }).finally(() => {
      self.loading = false;
    });
  };

  this.getDisplayValue = function () {
    return TucPackXdslModemMediator.info.mtuSize
      ? TucPackXdslModemMediator.info.mtuSize : PACK_XDSL_MODEM.mtu.default;
  };

  const init = function () {
    self.mtuValues = PACK_XDSL_MODEM.mtu.values;
    self.mtuCurrentValue = _.find(self.mtuValues, { value: self.getDisplayValue() });
    self.undo();
  };

  init();
});
