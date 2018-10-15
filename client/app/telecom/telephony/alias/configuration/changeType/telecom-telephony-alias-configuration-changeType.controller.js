angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationChangeTypeCtrl', function ($scope, $q, $translate, $state, $stateParams, TelephonyMediator, Toast, voipServiceTask, telephonyBulk) {
  const self = this;

  self.number = null;
  self.noCache = false;
  self.loading = {
    changing: false,
    line: true,
  };

  self.successfulTasks = [];

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.changeType = function () {
    self.loading.changing = true;

    return self.number.changeFeatureType().then(() => {
      self.number.feature.stopEdition();
      $state.go('telecom.telephony.alias.configuration');
      return Toast.success($translate.instant('telephony_alias_change_type_ok'));
    }, (error) => {
      if (error.type !== 'poller') {
        // Do not display Toast if it is a poller error
        Toast.error([$translate.instant('telephony_alias_change_type_ko'), (error.data && error.data.message) || ''].join(' '));
      }
      return $q.reject(error);
    }).finally(() => {
      self.loading.changing = false;
    });
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  function init() {
    self.loading.line = true;

    return TelephonyMediator.getGroup($stateParams.billingAccount, self.noCache).then((group) => {
      self.number = group.getNumber($stateParams.serviceName);
      return self.number;
    }).then(() => {
      self.availableTypes = [
        { id: 'redirect', label: $translate.instant('telephony_alias_config_change_type_label_redirect') },
        { id: 'ddi', label: $translate.instant('telephony_alias_config_change_type_label_ddi') },
        { id: 'conference', label: $translate.instant('telephony_alias_config_change_type_label_conference') },
        { id: 'cloudIvr', label: $translate.instant('telephony_alias_config_change_type_label_cloudIvr') },
        { id: 'svi', label: $translate.instant('telephony_alias_config_change_type_label_svi') },
        { id: 'easyHunting', label: $translate.instant('telephony_alias_config_change_type_label_easyHunting') },
        { id: 'cloudHunting', label: $translate.instant('telephony_alias_config_change_type_label_cloudHunting') },
        { id: 'contactCenterSolution', label: $translate.instant('telephony_alias_config_change_type_label_contactCenterSolution') },
        { id: 'contactCenterSolutionExpert', label: $translate.instant('telephony_alias_config_change_type_label_contactCenterSolutionExpert') },
        { id: 'empty', label: $translate.instant('telephony_alias_config_change_type_label_empty') },
      ];

      self.number.feature.startEdition();
      self.noCache = false;

      return self.number;
    }).catch((error) => {
      Toast.error([$translate.instant('telephony_alias_load_error'), (error.data && error.data.message) || ''].join(' '));
      return $q.reject(error);
    })
      .finally(() => {
        self.loading.line = false;
      });
  }

  $scope.$on('$destroy', () => {
    if (self.number && self.number.feature) {
      self.number.feature.stopEdition(true);
    }
  });

  /* -----  End of INITIALIZATION  ------*/

  /* ===========================
  =            BULK            =
  ============================ */

  self.bulkDatas = {
    infos: {
      name: 'configurationNumberChangeType',
      actions: [{
        name: 'options',
        route: '/telephony/{billingAccount}/number/{serviceName}/changeFeatureType',
        method: 'POST',
        params: null,
      }],
    },
  };

  self.getBulkParams = function () {
    const data = {
      featureType: self.number.feature.featureType,
    };

    return data;
  };

  self.onBulkSuccess = function (bulkResult) {
    // check if server tasks are all successful
    self.checkServerTasksStatus(bulkResult.success).then(() => {
      // if one of the promises fails, the failed result won't be store in tasksChecked
      if (self.successfulTasks.length < bulkResult.success.length) {
        Toast.warn([$translate.instant('telephony_alias_config_change_type_bulk_server_tasks_some_error')]);
      }

      telephonyBulk.getToastInfos(bulkResult, {
        fullSuccess: $translate.instant('telephony_alias_config_change_type_bulk_all_success'),
        partialSuccess: $translate.instant('telephony_alias_config_change_type_bulk_some_success', {
          count: bulkResult.success.length,
        }),
        error: $translate.instant('telephony_alias_config_change_type_bulk_error'),
      }).forEach((toastInfo) => {
        Toast[toastInfo.type](toastInfo.message, {
          hideAfter: null,
        });
      });

      // force v7 reset cache
      TelephonyMediator.getAll(true).then(() => {
        $state.go('telecom.telephony.alias.configuration');
      });
    }, () => {
      Toast.error([$translate.instant('telephony_alias_config_change_type_bulk_server_tasks_all_error')]);
      self.loading.changing = false;
    });
  };

  self.onBulkError = function (error) {
    Toast.error([$translate.instant('telephony_alias_config_change_type_bulk_on_error'), _.get(error, 'msg.data')].join(' '));
  };


  self.checkServerTasksStatus = function (updatedServices) {
    function runPollOnTask(billingAccount, serviceName, taskId) {
      return function () {
        return voipServiceTask.startPolling(billingAccount, serviceName, taskId);
      };
    }

    self.loading.changing = true;

    let chain = $q.when();

    _.forEach(updatedServices, (service) => {
      const id = _.head(_.chain(service.values).map('value').filter(val => val.action === 'changeType').value()).taskId;

      // chaining each promises
      chain = chain.then(runPollOnTask(service.billingAccount, service.serviceName, id))
        .then((result) => {
          if (result) {
            self.successfulTasks.push(result);
          }
        });
    });

    return chain;
  };

  /* -----  End of BULK  ------ */

  init();
});
