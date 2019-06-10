angular.module('managerApp').controller('TelecomTelephonyAliasPortabilitiesCtrl', function ($q, $stateParams, $translate, $uibModal, OvhApiTelephony, TucToast) {
  const self = this;

  self.loading = {
    cancel: false,
  };

  self.serviceName = $stateParams.serviceName;

  function fetchPortability() {
    return OvhApiTelephony.Portability().v6().query({
      billingAccount: $stateParams.billingAccount,
    }).$promise.then(ids => $q.all(_.map(ids, id => OvhApiTelephony.Portability().v6().get({
      billingAccount: $stateParams.billingAccount,
      id,
    }).$promise.then(porta => $q.all({
      steps: OvhApiTelephony.Portability().v6().getStatus({
        billingAccount: $stateParams.billingAccount,
        id,
      }).$promise,
      canBeCancelled: OvhApiTelephony.Portability().v6().canBeCancelled({
        billingAccount: $stateParams.billingAccount,
        id,
      }).$promise,
      documentAttached: OvhApiTelephony.Portability().PortabilityDocument().v6().query({
        billingAccount: $stateParams.billingAccount,
        id,
      }).$promise,
    }).then((results) => {
      console.log('results', results);
      _.set(porta, 'steps', results.steps);
      _.set(porta, 'canBeCancelled', results.canBeCancelled.value);
      _.set(porta, 'documentAttached', results.documentAttached);
      return porta;
    })))));
  }

  function groupPortaByNumbers(portabilities) {
    const numbers = [];
    _.forEach(portabilities, (porta) => {
      _.forEach(porta.numbersList, (number) => {
        numbers.push({
          number,
          portability: porta,
          lastStepDone: _.find(porta.steps.slice().reverse(), { status: 'done' }),
        });
      });
    });
    return numbers;
  }

  function init() {
    self.isLoading = true;
    fetchPortability().then((result) => {
      self.numbers = groupPortaByNumbers(result);
    }).catch((error) => {
      TucToast.error([$translate.instant('telephony_alias_portabilities_load_error'), _.get(error, 'data.message')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.isLoading = false;
    });
  }

  self.confirmCancelPortability = function (portability) {
    self.loading.cancel = true;

    return OvhApiTelephony.Portability().v6().cancel({
      billingAccount: $stateParams.billingAccount,
      id: portability.id,
    }, {}).$promise.then(() => {
      TucToast.success($translate.instant('telephony_alias_portabilities_cancel_success'));
      return init();
    }).catch((error) => {
      TucToast.error([$translate.instant('telephony_alias_portabilities_cancel_error'), _.get(error, 'data.message')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loading.cancel = false;
    });
  };

  self.attachMandate = function (number) {
    console.log('attache mandate', number);
    const modal = $uibModal.open({
      animation: true,
      templateUrl: 'app/telecom/telephony/alias/portability/portabilities/attach/telecom-telephony-alias-portability-portabilities-attach.html',
      controller: 'TelecomTelephonyServicePortabilityMandateAttachCtrl',
      controllerAs: '$ctrl',
      resolve: {
        data: () => ({
          id: number.portability.id,
        }),
      },
    });

    modal.result.then((mandate) => {
      console.log(mandate);
    });
    /*
    modal.result.then((conditions) => {
      // Set existing condition state to delete
      _.forEach(self.number.feature.timeCondition.conditions, (condition) => {
        _.set(condition, 'state', 'TO_DELETE');
      });

      return self.number.feature.timeCondition.saveConditions().then(() => {
        self.number.feature.timeCondition.conditions = self.number.feature.timeCondition.conditions
          .concat(_.map(conditions, (condition) => {
            _.set(condition, 'billingAccount', $stateParams.billingAccount);
            _.set(condition, 'serviceName', $stateParams.serviceName);
            _.set(condition, 'state', 'TO_CREATE');
            _.set(condition, 'featureType', 'easyHunting');

            _.set(condition, 'day', condition.weekDay);
            _.set(condition, 'hourBegin', condition.timeFrom.split(':').slice(0, 2).join(''));
            _.set(condition, 'hourEnd', condition.timeTo.split(':').slice(0, 2).join(''));

            _.set(condition, 'featureType', 'sip');

            return new VoipTimeConditionCondition(condition);
          }));

        uiCalendarConfig.calendars.conditionsCalendar.fullCalendar('refetchEvents');
        return self.number.feature.timeCondition.saveConditions().then(() => {
          TucToast.success(
            $translate.instant('telephony_common_time_condition_import_configuration_success'));
        }).catch(() => {
          TucToast.error(
            $translate.instant('telephony_common_time_condition_import_configuration_error'));
        }).finally(() => {
          self.$onInit();
        });
      });
    }).catch((error) => {
      if (error) {
        TucToast.error(
          $translate.instant('telephony_common_time_condition_import_configuration_error'));
      }
    });
    */
  };

  init();
});
