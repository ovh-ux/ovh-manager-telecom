angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationRecordsEasyHuntingCtrl', function ($q, $stateParams, TelephonyMediator, OvhApiTelephony, ToastError) {
  const self = this;

  /*= ==============================
  =            HELPERS            =
  =============================== */

  self.fetchQueues = function () {
    return OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise
      .then(ids => $q.all(_.map(ids, id => OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
        .get({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
          queueId: id,
        }).$promise)));
  };

  self.fetchRecords = function () {
    OvhApiTelephony.EasyHunting().Records().v6().resetAllCache();
    return OvhApiTelephony.EasyHunting().Records().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise
      .then(recordsIds => $q.all(_.map(_.chunk(recordsIds, 50), chunkIds =>
        OvhApiTelephony.EasyHunting().Records().v6().getBatch({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
          id: chunkIds,
        }).$promise)).then(chunkResult => _.pluck(_.flatten(chunkResult), 'value')));
  };

  /* -----  End of HELPERS  ------*/

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.updateQueue = function (queue) {
    const attrs = ['record', 'askForRecordDisabling', 'recordDisablingLanguage', 'recordDisablingDigit'];
    return OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
      .change({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        queueId: _.get(queue, 'queueId'),
      }, _.pick(queue, attrs)).$promise;
  };

  self.deleteSelectedRecords = function (records) {
    return $q.all(_.map(records, record => OvhApiTelephony.EasyHunting().Records().v6().remove({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      id: record.id,
    }).$promise));
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  function init() {
    self.isLoading = true;
    return TelephonyMediator.getGroup($stateParams.billingAccount).then((group) => {
      self.number = group.getNumber($stateParams.serviceName);
      return self.number.feature.init().then(() => {
        if (self.number.getFeatureFamily() === 'easyHunting') {
          self.recordsApi = {
            fetchQueues: self.fetchQueues,
            updateQueue: self.updateQueue,
            fetchRecords: self.fetchRecords,
            deleteSelectedRecords: self.deleteSelectedRecords,
          };
        }
      });
    }).catch(err => new ToastError(err)).finally(() => {
      self.isLoading = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
