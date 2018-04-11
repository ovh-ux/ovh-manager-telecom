angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationModeEasyHuntingCtrl", function ($stateParams, $q, $translate, $uibModal, OvhApiTelephony, OvhApiMe, Toast, ToastError) {
    "use strict";

    var self = this;

    function fetchEnums () {
        return OvhApiTelephony.v6().schema().$promise.then(function (result) {
            var enums = {};
            enums.caller = _.get(result, ["models", "telephony.OvhPabxDialplanNumberPresentationEnum", "enum"]);
            enums.strategy = _.get(result, ["models", "telephony.OvhPabxHuntingQueueStrategyEnum", "enum"]);
            return enums;
        });
    }

    function fetchOptions () {
        return OvhApiTelephony.EasyHunting().v6().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchQueueOptions () {
        return OvhApiTelephony.EasyHunting().Hunting().Queue().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (queueId) {
            return OvhApiTelephony.EasyHunting().Hunting().Queue().v6().get({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: queueId
            }).$promise.then(function (opts) {
                // because value is stored as string in api but sound is an integer
                if (opts.actionOnOverflowParam) {
                    opts.actionOnOverflowParam = parseInt(opts.actionOnOverflowParam, 10);
                }
                return opts;
            });
        });
    }

    function fetchVoicemail () {
        var voiceMailPromises = [];
        var voicemails = [];
        return OvhApiTelephony.v6().query().$promise.then(function (billingAccounts) {
            billingAccounts.forEach(function (billingAccount) {
                voiceMailPromises.push(OvhApiTelephony.Voicemail().v6().query({
                    billingAccount: billingAccount
                }).$promise.then(function (response) {
                    voicemails = voicemails.concat(response);
                }).catch(function (error) {
                    if (error.status === 460) {
                        return [];
                    }
                    return $q.reject(error);
                }));
            });

            return $q.all(voiceMailPromises).then(function () {
                return voicemails;
            });
        });
    }

    function fetchSounds () {
        return OvhApiTelephony.EasyHunting().Sound().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.EasyHunting().Sound().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    soundId: id
                }).$promise;
            }));
        });
    }

    function init () {
        self.isLoading = true;
        return $q.all({
            enums: fetchEnums(),
            options: fetchOptions(),
            queueOptions: fetchQueueOptions(),
            voicemail: fetchVoicemail(),
            sounds: fetchSounds()
        }).then(function (result) {
            self.enums = result.enums;
            self.options = result.options;
            self.optionsForm = angular.copy(self.options);
            self.queueOptions = result.queueOptions;
            self.queueOptionsForm = angular.copy(self.queueOptions);
            self.voicemail = result.voicemail;
            self.sounds = result.sounds;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
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
        return fetchSounds().then(function (sounds) {
            // we mutate sounds array because it is used in the modal aswell
            self.sounds.length = 0;
            Array.prototype.push.apply(self.sounds, sounds);
        }).catch(function (err) {
            return new ToastError(err);
        });
    };

    self.openManageSoundsHelper = function (toneType) {
        self.managingSounds = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "components/telecom/alias/hunting/sounds/telecom-telephony-alias-hunting-sounds.html",
            controller: "TelecomTelephonyAliasHuntingSoundsCtrl",
            controllerAs: "$ctrl",
            resolve: {
                params: function () {
                    return {
                        sounds: self.sounds,
                        apiEndpoint: OvhApiTelephony.EasyHunting(),
                        refreshSounds: self.refreshSounds
                    };
                }
            }
        });
        modal.result.then(function (sound) {
            if (sound) {
                if (toneType === "toneOnOverflow") {
                    self.queueOptionsForm.actionOnOverflow = "playback";
                    self.queueOptionsForm.actionOnOverflowParam = sound.soundId;
                } else {
                    self.optionsForm[toneType] = sound.soundId;
                }
            }
        }).finally(function () {
            self.managingSounds = false;
        });
        return modal;
    };

    self.updateOptions = function () {
        var pending = [];
        var attrs;

        if (!angular.equals(self.queueOptions, self.queueOptionsForm)) {
            attrs = ["actionOnOverflow", "actionOnOverflowParam", "followCallForwards"];
            if (self.queueOptionsForm.actionOnOverflowParam) {
                self.queueOptionsForm.actionOnOverflow = "playback";
            } else {
                self.queueOptionsForm.actionOnOverflow = null;
                self.queueOptionsForm.actionOnOverflowParam = null;
            }
            pending.push(OvhApiTelephony.EasyHunting().Hunting().Queue().v6().change({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                queueId: self.queueOptions.queueId
            }, _.pick(self.queueOptionsForm, attrs)).$promise.then(function () {
                self.queueOptions = angular.copy(self.queueOptionsForm);
            }));
        }

        if (!angular.equals(self.options, self.optionsForm)) {
            attrs = ["anonymousRejection", "description", "maxWaitTime", "queueSize", "showCallerNumber",
                "strategy", "toneOnClosing", "toneOnHold", "toneOnOpening", "voicemail"];
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
                serviceName: $stateParams.serviceName
            }, _.pick(self.optionsForm, attrs)).$promise.then(function () {
                self.options = angular.copy(self.optionsForm);
            }));
        }

        self.isUpdating = true;
        return $q.all(pending).then(function () {
            Toast.success($translate.instant("telephony_alias_configuration_mode_easyhunting_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isUpdating = false;
        });
    };

    init();
});
