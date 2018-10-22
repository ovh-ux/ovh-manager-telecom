angular.module('managerApp').controller('TelecomDashboardCtrl', function (TelecomMediator, ToastError, URLS) {
  const self = this;

  self.loading = {
    vip: false,
  };

  self.expressLiteOrder = URLS.orderExpressLite;
  self.isVip = false;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.loading.vip = true;

    return TelecomMediator.deferred.vip.promise.then((vipStatus) => {
      self.isVip = vipStatus;
    }, err => new ToastError(err, 'telecom_dashboard_auth_failed')).finally(() => {
      self.loading.vip = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
