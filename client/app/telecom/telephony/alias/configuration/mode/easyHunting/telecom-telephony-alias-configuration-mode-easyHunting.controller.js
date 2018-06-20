angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationModeEasyHuntingCtrl', function ($stateParams, $q, $translate, $uibModal, OvhApiTelephony, OvhApiMe, Toast, ToastError) {
  const self = this;

  function fetchEnums() {
    return OvhApiTelephony.v6().schema().$promise.then((result) => {
      const enums = {};
      enums.caller = _.get(result, ['models', 'telephony.OvhPabxDialplanNumberPresentationEnum', 'enum']);
      enums.strategy = _.get(result, ['models', 'telephony.OvhPabxHuntingQueueStrategyEnum', 'enum']);
      return enums;
    });
  }

  function fetchOptions() {
    return OvhApiTelephony.EasyHunting().v6().get({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }).$promise;
  }

  function fetchQueueOptions() {
    return OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
      .query({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }).$promise.then(queueId => OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
        .get({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
          queueId,
        }).$promise.then((opts) => {
          // because value is stored as string in api but sound is an integer
          if (opts.actionOnOverflowParam) {
            _.set(opts, 'actionOnOverflowParam', parseInt(opts.actionOnOverflowParam, 10));
          }
          return opts;
        }));
  }

  function fetchVoicemail() {
    const voiceMailPromises = [];
    let voicemails = [];
    return OvhApiTelephony.v6().query().$promise.then((billingAccounts) => {
      billingAccounts.forEach((billingAccount) => {
        voiceMailPromises.push(OvhApiTelephony.Voicemail().v6().query({
          billingAccount,
        }).$promise.then((response) => {
          voicemails = voicemails.concat(response);
        }).catch((error) => {
          if (error.status === 460) {
            return [];
          }
          return $q.reject(error);
        }));
      });

      return $q.all(voiceMailPromises).then(() => voicemails);
    });
  }

  function fetchSounds() {
    return OvhApiTelephony.EasyHunting().Sound().v6().query({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
    }).$promise.then(ids => $q.all(_.map(ids, id => OvhApiTelephony.EasyHunting().Sound().v6().get({
      billingAccount: $stateParams.billingAccount,
      serviceName: $stateParams.serviceName,
      soundId: id,
    }).$promise)));
  }

  function init() {
    self.isLoading = true;
    return $q.all({
      enums: fetchEnums(),
      options: fetchOptions(),
      queueOptions: fetchQueueOptions(),
      voicemail: fetchVoicemail(),
      sounds: fetchSounds(),
    }).then((result) => {
      self.enums = result.enums;
      self.options = result.options;
      self.optionsForm = angular.copy(self.options);
      self.queueOptions = result.queueOptions;
      self.queueOptionsForm = angular.copy(self.queueOptions);
      self.voicemail = result.voicemail;
      self.sounds = result.sounds;
    }).catch(err => new ToastError(err)).finally(() => {
      self.isLoading = false;
    });
  }

  self.hasChanges = function () {
    return !(angular.equals(self.options, self.optionsForm) &&
      angular.equals(self.queueOptions, self.queueOptionsForm));
  };

  self.undoChanges = function () {
    self.optionsForm = angular.copy(self.options);
    self.queueOptionsForm = angular.copy(self.queueOptions);
  };

  self.refreshSounds = function () {
    return fetchSounds().then((sounds) => {
      // we mutate sounds array because it is used in the modal aswell
      self.sounds.length = 0;
      Array.prototype.push.apply(self.sounds, sounds);
    }).catch(err => new ToastError(err));
  };

  self.openManageSoundsHelper = function (toneType) {
    self.managingSounds = true;
    const modal = $uibModal.open({
      animation: true,
      templateUrl: 'components/telecom/alias/hunting/sounds/telecom-telephony-alias-hunting-sounds.html',
      controller: 'TelecomTelephonyAliasHuntingSoundsCtrl',
      controllerAs: '$ctrl',
      resolve: {
        params() {
          return {
            sounds: self.sounds,
            apiEndpoint: OvhApiTelephony.EasyHunting(),
            refreshSounds: self.refreshSounds,
          };
        },
      },
    });
    modal.result.then((sound) => {
      if (sound) {
        if (toneType === 'toneOnOverflow') {
          self.queueOptionsForm.actionOnOverflow = 'playback';
          self.queueOptionsForm.actionOnOverflowParam = sound.soundId;
        } else {
          self.optionsForm[toneType] = sound.soundId;
        }
      }
    }).finally(() => {
      self.managingSounds = false;
    });
    return modal;
  };

  self.updateOptions = function () {
    const pending = [];
    let attrs;

    if (!angular.equals(self.queueOptions, self.queueOptionsForm)) {
      attrs = ['actionOnOverflow', 'actionOnOverflowParam', 'followCallForwards'];
      if (self.queueOptionsForm.actionOnOverflowParam) {
        self.queueOptionsForm.actionOnOverflow = 'playback';
      } else {
        self.queueOptionsForm.actionOnOverflow = null;
        self.queueOptionsForm.actionOnOverflowParam = null;
      }
      pending.push(OvhApiTelephony.EasyHunting().Hunting().Queue().v6()
        .change({
          billingAccount: $stateParams.billingAccount,
          serviceName: $stateParams.serviceName,
          queueId: self.queueOptions.queueId,
        }, _.pick(self.queueOptionsForm, attrs)).$promise.then(() => {
          self.queueOptions = angular.copy(self.queueOptionsForm);
        }));
    }

    if (!angular.equals(self.options, self.optionsForm)) {
      attrs = ['anonymousRejection', 'description', 'maxWaitTime', 'queueSize', 'showCallerNumber',
        'strategy', 'toneOnClosing', 'toneOnHold', 'toneOnOpening', 'voicemail'];
      if (!self.optionsForm.toneOnClosing) {
        self.optionsForm.toneOnClosing = null;
      }
      if (!self.optionsForm.toneOnHold) {
        self.optionsForm.toneOnHold = null;
      }
      if (!self.optionsForm.toneOnOpening) {
        self.optionsForm.toneOnOpening = null;
      }
      if (!self.optionsForm.voicemail) {
        self.optionsForm.voicemail = null;
      }
      pending.push(OvhApiTelephony.EasyHunting().v6().change({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }, _.pick(self.optionsForm, attrs)).$promise.then(() => {
        self.options = angular.copy(self.optionsForm);
      }));
    }

    self.isUpdating = true;
    return $q.all(pending).then(() => {
      Toast.success($translate.instant('telephony_alias_configuration_mode_easyhunting_success'));
    }).catch(err => new ToastError(err)).finally(() => {
      self.isUpdating = false;
    });
  };

  init();
});
