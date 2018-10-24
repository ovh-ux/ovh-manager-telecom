angular.module('managerApp').controller('XdslModemManagedByCtrl', function ($stateParams, $q, $translate, OvhApiXdsl, Toast, TucPackXdslModemMediator) {
  const self = this;

  this.mediator = TucPackXdslModemMediator;

  this.undo = function () {
    _.set(TucPackXdslModemMediator, 'info.managedByOvh', !TucPackXdslModemMediator.info.managedByOvh);
    TucPackXdslModemMediator.unsetTask('changeModemConfigManagement');
  };

  this.tooltip = _.get(this.mediator, 'info.managedByOvh')
    ? ['<strong class="text-warning">', $translate.instant('xdsl_modem_managedBy_warning'), '</strong>'].join('')
    : ['<strong class="text-warning">', $translate.instant('xdsl_modem_managedBy_warning_override'), '</strong>'].join('');

  this.changeManagedBy = function () {
    if (_.isEmpty($stateParams.serviceName)) {
      Toast.error($translate.instant('xdsl_modem_managedBy_an_error_ocurred'));
      return $q.reject();
    }
    this.updating = true;
    TucPackXdslModemMediator.setTask('changeModemConfigManagement');
    TucPackXdslModemMediator.disableCapabilities();
    return OvhApiXdsl.Modem().v6().update(
      {
        xdslId: $stateParams.serviceName,
      },
      {
        managedByOvh: TucPackXdslModemMediator.info.managedByOvh,
      },
    ).$promise.then((data) => {
      if (TucPackXdslModemMediator.info.managedByOvh) {
        Toast.success($translate.instant('xdsl_modem_managedBy_success_validation_on'));
      } else {
        Toast.success($translate.instant('xdsl_modem_managedBy_success_validation_off'));
      }
      return data;
    }).catch((err) => {
      self.undo();
      Toast.error($translate.instant('xdsl_modem_managedBy_an_error_ocurred'));
      return $q.reject(err);
    }).finally(() => {
      self.updating = false;
    });
  };
});
