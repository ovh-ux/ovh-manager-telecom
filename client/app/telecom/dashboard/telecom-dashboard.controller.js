angular.module('managerApp').controller('TelecomDashboardCtrl', function ($translate, OvhApiMe, TelecomMediator, ToastError, URLS) {
  const self = this;

  self.loading = {
    vip: false,
  };

  self.expressLiteOrder = URLS.orderExpressLite;
  self.isVip = false;

  function buildSummitData() {
    self.localeForSummitBanner = $translate.use().split('_')[0] === 'fr' ? 'fr' : 'en';

    const subsidiariesWithSummitBanner = ['FR', 'GB', 'DE', 'ES'];
    self.shouldDisplayBanner = false;
    return OvhApiMe.v6()
      .get().$promise
      .then(({ ovhSubsidiary }) => {
        self.shouldDisplayBanner = _(subsidiariesWithSummitBanner).includes(ovhSubsidiary);
      });
  }

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.loading.vip = true;

    buildSummitData();

    return TelecomMediator.deferred.vip.promise.then((vipStatus) => {
      self.isVip = vipStatus;
    }, err => new ToastError(err, 'telecom_dashboard_auth_failed')).finally(() => {
      self.loading.vip = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
