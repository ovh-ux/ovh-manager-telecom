angular.module('managerApp').controller('TelecomTelephonyAliasHuntingSoundsCtrl', function ($stateParams, $uibModalInstance, $timeout, $q, $translate, $translatePartialLoader, params, OvhApiMe, ToastError, voipServiceTask) {
  const self = this;

  function init() {
    self.sounds = params.sounds;
    self.apiEndpoint = params.apiEndpoint;
    self.isInitialized = false;
    $translatePartialLoader.addPart('../components/telecom/alias/hunting/sounds');
    return $translate.refresh().finally(() => {
      self.isInitialized = true;
    });
  }

  self.close = function () {
    $uibModalInstance.dismiss();
  };

  self.checkValidAudioExtention = function (file) {
    const validExtensions = ['aiff', 'au', 'flac', 'ogg', 'mp3', 'wav', 'wma'];
    const fileName = file ? file.name : '';
    const found = _.some(validExtensions, ext => _.endsWith(fileName.toLowerCase(), ext));
    if (!found) {
      ToastError($translate.instant('telephony_alias_hunting_sounds_invalid'));
    }
    return found;
  };

  self.uploadFile = function () {
    // api does not handle space characters in filenames
    const name = (self.toUpload.name || '').replace(/\s/g, '_');
    self.isUploading = true;

    // first, upload document to get a file url
    return OvhApiMe.Document().v6().upload(
      name,
      self.toUpload,
    ).then(doc =>
    // second upload the file with given url
      self.apiEndpoint.v6().soundUpload({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
      }, {
        name,
        url: doc.getUrl,
      }).$promise.then(result => voipServiceTask.startPolling(
        $stateParams.billingAccount,
        $stateParams.serviceName,
        result.taskId,
        {
          namespace: `soundUploadTask_${$stateParams.serviceName}`,
          interval: 1000,
          retryMaxAttempts: 0,
        },
      ).catch((err) => {
        // When the task does not exist anymore it is considered done (T_T)
        if (err.status === 404) {
          // add some delay to ensure we get the sound from api when refreshing
          return $timeout(() => $q.when(true), 2000);
        }
        return $q.reject(err);
      })))
      .then(() => {
        self.toUpload = null;
        params.refreshSounds();
      })
      .catch(err => new ToastError(err))
      .finally(() => {
        self.isUploading = false;
      });
  };

  self.chooseSound = function (sound) {
    $uibModalInstance.close(sound);
  };

  self.deleteSound = function (sound) {
    _.set(sound, 'isDeleting', true);
    return $q.all([
      $timeout(angular.noop, 500),
      self.apiEndpoint.Sound().v6().remove({
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        soundId: sound.soundId,
      }).$promise.then(() => {
        _.remove(self.sounds, { soundId: sound.soundId });
      }).catch(err => new ToastError(err)).finally(() => {
        _.set(sound, 'isDeleting', false);
      }),
    ]);
  };

  init();
});
