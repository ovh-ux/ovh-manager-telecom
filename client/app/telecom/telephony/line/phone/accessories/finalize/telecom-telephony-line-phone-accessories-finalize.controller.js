angular.module('managerApp').controller('TelecomTelephonyLinePhoneAccessoriesFinalizeCtrl', function ($q, TelephonyAccessoriesOrderProcess) {
  const self = this;

  self.process = null;
  self.order = null;
  self.error = null;
  self.loading = {
    init: false,
  };

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.loading.init = true;
    self.process = TelephonyAccessoriesOrderProcess.getOrderProcess();

    return TelephonyAccessoriesOrderProcess.orderCheckout().then((order) => {
      self.order = order;
    }, (error) => {
      self.error = error;
      return $q.reject(error);
    }).finally(() => {
      self.loading.init = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
