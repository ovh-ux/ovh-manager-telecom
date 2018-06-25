angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationCallsFilteringEasyHuntingCtrl', function ($stateParams, $q, $translate, OvhApiTelephony, ToastError, telephonyBulk, Toast) {
  const self = this;

  self.fetchStatus = function () {
    return OvhApiTelephony.EasyHunting().ScreenListConditions().v6().get({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }).$promise;
  };

  self.fetchScreenLists = function () {
    OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6()
      .resetAllCache();
    return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise
      .then(ids => $q.all(_.map(_.chunk(ids, 50), chunkIds =>
        OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6()
          .getBatch({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            conditionId: chunkIds,
          }).$promise))
        .then((chunkResult) => {
          const result = _.pluck(_.flatten(chunkResult), 'value');
          return _.each(result, (filter) => {
            _.set(filter, 'id', filter.conditionId);
            _.set(filter, 'callNumber', filter.callerIdNumber);
            _.set(filter, 'nature', 'international');
            _.set(filter, 'status', 'active');
            _.set(filter, 'type', filter.screenListType);
            _.set(filter, 'shortType', _.startsWith(filter.screenListType, 'incoming') ? 'incoming' : 'outgoing');
            _.set(filter, 'list', filter.screenListType.indexOf('White') >= 0 ? 'white' : 'black');
          });
        }));
  };

  self.removeScreenList = function (screen) {
    return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6()
      .remove({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        conditionId: screen.id,
      }).$promise;
  };

  self.addScreenList = function (screen) {
    return OvhApiTelephony.EasyHunting().ScreenListConditions().Conditions().v6()
      .create({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }, {
        screenListType: screen.type.replace(/outgoing/, 'destination'),
        callerIdNumber: screen.callNumber,
      }).$promise;
  };

  self.onScreenListAdded = function () {
    self.screenLists.update();
  };

  self.updateScreen = function () {
    self.screenStatus.isLoading = true;
    return OvhApiTelephony.EasyHunting().ScreenListConditions().v6().change({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }, {
      status: self.screenStatus.modified,
    }).$promise.then(() => {
      self.screenStatus.raw = angular.copy(self.screenStatus.modified);
    }).catch((err) => {
      self.screenStatus.modified = angular.copy(self.screenStatus.raw);
      return new ToastError(err);
    }).finally(() => {
      self.screenStatus.isLoading = false;
    });
  };

  function init() {
    self.screenLists = {
      fetchAll: self.fetchScreenLists,
      remove: self.removeScreenList,
      update: angular.noop,
      getList() {
        return [];
      },
    };
    self.screenStatus = {
      raw: null,
      modified: null,
      isLoading: false,
    };
    self.screenStatus.isLoading = true;
    return self.fetchStatus().then((result) => {
      self.screenStatus.raw = result.status;
      self.screenStatus.modified = angular.copy(result.status);
    }).catch(err => new ToastError(err)).finally(() => {
      self.screenStatus.isLoading = false;
    });
  }

  init();

  self.bulkDatas = {
    billingAccount: $stateParams.billingAccount,
    serviceName: $stateParams.serviceName,
    infos: {
      name: 'screenListConditions',
      actions: [{
        name: 'screenListConditions',
        route: '/telephony/{billingAccount}/easyHunting/{serviceName}/screenListConditions',
        method: 'PUT',
        params: null,
      }],
    },
  };

  self.filterServices = function (services) {
    return _.filter(services, service => ['easyHunting', 'contactCenterSolution'].indexOf(service.featureType) > -1);
  };

  self.getBulkParams = function () {
    return {
      status: _.get(self, 'screenStatus.modified'),
    };
  };

  self.onBulkSuccess = function (bulkResult) {
    // display message of success or error
    telephonyBulk.getToastInfos(bulkResult, {
      fullSuccess: $translate.instant('telephony_line_calls_filtering_bulk_all_success'),
      partialSuccess: $translate.instant('telephony_line_calls_filtering_bulk_some_success', {
        count: bulkResult.success.length,
      }),
      error: $translate.instant('telephony_line_calls_filtering_bulk_error'),
    }).forEach((toastInfo) => {
      Toast[toastInfo.type](toastInfo.message, {
        hideAfter: null,
      });
    });

    window.location.reload();
  };

  self.onBulkError = function (error) {
    Toast.error([$translate.instant('telephony_line_calls_filtering_bulk_on_error'), _.get(error, 'msg.data')].join(' '));
  };
});
