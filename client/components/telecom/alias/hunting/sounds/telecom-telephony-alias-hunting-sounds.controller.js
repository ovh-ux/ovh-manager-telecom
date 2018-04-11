angular.module("managerApp").controller("TelecomTelephonyAliasHuntingSoundsCtrl", function ($stateParams, $uibModalInstance, $timeout, $q, $translate, $translatePartialLoader, params, OvhApiMe, ToastError, voipServiceTask) {
    "use strict";

    var self = this;

    function init () {
        self.sounds = params.sounds;
        self.apiEndpoint = params.apiEndpoint;
        self.isInitialized = false;
        $translatePartialLoader.addPart("../components/telecom/alias/hunting/sounds");
        return $translate.refresh().finally(function () {
            self.isInitialized = true;
        });
    }

    self.close = function () {
        $uibModalInstance.dismiss();
    };

    self.checkValidAudioExtention = function (file) {
        var validExtensions = ["aiff", "au", "flac", "ogg", "mp3", "wav", "wma"];
        var fileName = file ? file.name : "";
        var found = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });
        if (!found) {
            ToastError($translate.instant("telephony_alias_hunting_sounds_invalid"));
        }
        return found;
    };

    self.uploadFile = function () {
        // api does not handle space characters in filenames
        var name = (self.toUpload.name || "").replace(/\s/g, "_");
        self.isUploading = true;

        // first, upload document to get a file url
        return OvhApiMe.Document().v6().upload(
            name,
            self.toUpload
        ).then(function (doc) {
            // second upload the file with given url
            return self.apiEndpoint.v6().soundUpload({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, {
                name: name,
                url: doc.getUrl
            }).$promise.then(function (result) {
                return voipServiceTask.startPolling(
                    $stateParams.billingAccount,
                    $stateParams.serviceName,
                    result.taskId,
                    {
                        namespace: "soundUploadTask_" + $stateParams.serviceName,
                        interval: 1000,
                        retryMaxAttempts: 0
                    }).catch(function (err) {
                    // When the task does not exist anymore it is considered done (T_T)
                        if (err.status === 404) {
                        // add some delay to ensure we get the sound from api when refreshing
                            return $timeout(function () {
                                return $q.when(true);
                            }, 2000);
                        }
                        return $q.reject(err);

                    });
            });
        }).then(function () {
            self.toUpload = null;
            params.refreshSounds();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isUploading = false;
        });
    };

    self.chooseSound = function (sound) {
        $uibModalInstance.close(sound);
    };

    self.deleteSound = function (sound) {
        sound.isDeleting = true;
        return $q.all([
            $timeout(angular.noop, 500),
            self.apiEndpoint.Sound().v6().remove({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                soundId: sound.soundId
            }).$promise.then(function () {
                _.remove(self.sounds, { soundId: sound.soundId });
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                sound.isDeleting = false;
            })
        ]);
    };

    init();
});
