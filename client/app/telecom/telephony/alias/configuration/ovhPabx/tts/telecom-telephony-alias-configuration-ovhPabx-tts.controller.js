angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationOvhPabxTtsCtrl', function ($q, $filter, $stateParams, $translate, TelephonyMediator, TucToast) {
  const self = this;

  self.loading = {
    init: false,
  };

  self.state = {
    collapse: false,
    orderBy: 'text',
    orderDesc: false,
    textDetail: null,
  };

  self.tts = {
    raw: null,
    paginated: null,
    sorted: null,
  };

  /*= ==============================
    =            HELPERS            =
    =============================== */

  self.sortTts = function () {
    self.tts.sorted = $filter('orderBy')(
      self.tts.raw,
      self.state.orderBy,
      self.state.orderDesc,
    );
  };

  self.isDeleting = function (tts) {
    return ['PENDING_DELETE', 'DELETING'].indexOf(tts.status) > -1;
  };

  self.orderBy = function (orderBy) {
    self.state.orderBy = orderBy;
    self.state.orderDesc = !self.state.orderDesc;
  };

  /* -----  End of HELPERS  ------*/

  /*= =============================
    =            EVENTS            =
    ============================== */

  self.onCreationCancel = function () {
    self.state.collapse = false;
  };

  self.onCreationSuccess = function () {
    self.tts.raw = self.number.feature.tts;
    self.sortTts();
    self.state.collapse = false;
  };

  self.onTtsDeleteBtnClick = function (tts) {
    return tts.remove().then(() => {
      self.number.feature.removeTts(tts);
      self.tts.raw = self.number.feature.tts;
      self.sortTts();
    }, (error) => {
      TucToast.error([$translate.instant('telephony_alias_ovh_pabx_tts_list_delete_error'), _.get(error, 'data.message', '')].join(' '));
      return $q.reject(error);
    });
  };

  /* -----  End of EVENTS  ------*/

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  self.$onInit = function () {
    self.loading.init = true;

    return TelephonyMediator.getGroup($stateParams.billingAccount).then((group) => {
      self.number = group.getNumber($stateParams.serviceName);

      return self.number.feature.init().then(() => {
        if (self.number.getFeatureFamily() === 'ovhPabx') {
          return self.number.feature.getTts().then(() => {
            self.tts.raw = self.number.feature.tts;
            self.sortTts();
          });
        }

        return $q.when(self.number.feature);
      });
    }).catch((error) => {
      TucToast.error([$translate.instant('telephony_alias_configuration_load_error'), _.get(error, 'data.message', '')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loading.init = false;
    });
  };

  /* -----  End of INITIALIZATION  ------*/
});
