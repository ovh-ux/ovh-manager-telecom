angular.module('managerApp').controller('TelecomTelephonyLinePhoneRebootCtrl', function ($q, $stateParams, $translate, $timeout, TucToast, TucToastError, OvhApiTelephony, TelephonyMediator) {
  const self = this;

  function init() {
    self.isLoading = true;
    TelephonyMediator
      .getGroup($stateParams.billingAccount)
      .then(group => group.getLine($stateParams.serviceName).getPhone()).then((phone) => {
        self.phone = phone;
        self.isRebootable = !/^phone\.(gigaset|cisco.spa112)/.test(self.phone.brand);
      })
      .catch(err => new TucToastError(err))
      .finally(() => {
        self.isLoading = false;
      });
  }

  self.reboot = function () {
    self.isRebooting = true;
    OvhApiTelephony.Line().Phone().v6().reboot({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }, {}).$promise.then(() => {
      self.rebootSuccess = true;
      $timeout(() => {
        self.rebootSuccess = false;
      }, 3000);
      TucToast.success($translate.instant('telephony_line_phone_reboot_success'));
    }).catch((err) => {
      if (err && err.status === 501) {
        TucToast.error($translate.instant('telephony_line_phone_reboot_unsupported'));
      } else {
        TucToast.error([$translate.instant('telephony_line_phone_reboot_error'), _.get(err, 'data.message')].join(' '));
      }
    }).finally(() => {
      self.isRebooting = false;
    });
  };

  init();
});
