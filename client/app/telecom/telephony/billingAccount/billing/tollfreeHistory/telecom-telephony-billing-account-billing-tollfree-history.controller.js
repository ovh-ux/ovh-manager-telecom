angular.module('managerApp').controller('TelecomTelephonyBillingAccountBillingTollfreeHistoryCtrl', function ($q, $filter, $window, $timeout, $stateParams, $translate, TelephonyMediator, OvhApiTelephony, Toast) {
  const self = this;

  self.group = null;
  self.consumptionData = null;

  /*= ==============================
  =            HELPERS            =
  =============================== */

  function fetchHistory() {
    return OvhApiTelephony.HistoryTollfreeConsumption().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
      }).$promise
      .then(dates => $q
        .all(_.map(
          _.chunk(dates, 50),
          chunkDates => OvhApiTelephony.HistoryTollfreeConsumption().v6().getBatch({
            billingAccount: $stateParams.billingAccount,
            date: chunkDates,
          }).$promise,
        ))
        .then((chunkResult) => {
          const result = _.pluck(_.flatten(chunkResult), 'value');
          return _.each(result, (consumption) => {
            _.set(consumption, 'priceValue', consumption.price ? consumption.price.value : null);
          });
        }))
      .catch((err) => {
        self.consumptionData = [];
        Toast.error([$translate.instant('telephony_group_billing_tollfree_history_download_error'), (err.data && err.data.message) || ''].join(' '));
        return $q.reject(err);
      });
  }

  self.fetchFile = function (consumption) {
    const tryDownload = function () {
      return OvhApiTelephony.HistoryTollfreeConsumption().v6().getDocument({
        billingAccount: $stateParams.billingAccount,
        date: consumption.date,
      }).$promise.then((info) => {
        if (info.status === 'error') {
          return $q.reject({
            statusText: 'Unable to download message',
          });
        } if (info.status === 'done') {
          return $q.when(info);
        }

        // file is not ready to download, just retry
        return $timeout(tryDownload, 1000);
      });
    };
    return tryDownload();
  };

  /* -----  End of HELPERS  ------*/

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.download = function (consumption) {
    return self.fetchFile(consumption).then((info) => {
      $window.location.href = info.url; // eslint-disable-line
    }).catch((err) => {
      Toast.error([$translate.instant('telephony_group_billing_tollfree_history_download_error'), (err.data && err.data.message) || ''].join(' '));
      return $q.reject(err);
    });
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  this.$onInit = function () {
    return TelephonyMediator.getGroup($stateParams.billingAccount).then((group) => {
      self.group = group;
      return fetchHistory().then((consumptions) => {
        self.consumptionData = consumptions;
      });
    }).catch((err) => {
      Toast.error([$translate.instant('telephony_group_billing_tollfree_history_init_error'), (err.data && err.data.message) || ''].join(' '));
      return $q.reject(err);
    });
  };
});
