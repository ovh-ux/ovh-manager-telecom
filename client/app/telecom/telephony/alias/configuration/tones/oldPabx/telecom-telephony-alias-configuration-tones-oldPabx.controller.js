angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationTonesOldPabxCtrl", function ($q, $stateParams, $translate, $timeout,
                                                                                                        TelephonyMediator, Toast, voipServiceTask,
                                                                                                        OvhApiMe, OvhApiTelephony, OvhApiTelephonyEasyPabx, OvhApiTelephonyMiniPabx) {
    "use strict";

    var self = this;
    var apiService;

    self.loaders = {
        init: false,
        save: false
    };

    self.tones = null;
    self.formOptions = null;
    self.formErrors = {};
    self.enums = {
        tones: [
            "None",
            "Custom sound"
        ],
        onHold: [
            "None",
            "Predefined 1",
            "Predefined 2",
            "Custom sound"
        ]
    };

    /* ==============================
    =            HELPERS            =
    =============================== */

    function fetchTones () {
        return apiService.Lexi().getTones({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.catch(function (error) {
            if (error.status === 404) {
                return {
                    ringback: "None",
                    onHold: "None",
                    endCall: "None"
                };
            }
            return $q.reject(error);
        });
    }

    self.checkValidSound = function (file, toneType) {
        // reset errors for tone type
        _.set(self.formErrors, toneType, {});

        // check for good format
        var validExtensions = ["wav", "mp3", "mp4", "ogg", "wma"];
        var fileName = file ? file.name : "";
        self.formErrors[toneType].format = !_.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });

        // check for file size
        self.formErrors[toneType].size = file.size > 10000000;
        return !self.formErrors[toneType].format && !self.formErrors[toneType].size;
    };

    self.hasChanges = function () {
        return !angular.equals(self.tones, _.pick(self.formOptions, ["ringback", "onHold", "endCall"]));
    };

    self.isFormValid = function () {
        return _.some(["ringback", "onHold", "endCall"], function (tone) {
            return self.formOptions[tone] === "Custom sound" && self.formOptions[tone + "Custom"];
        });
    };

    function uploadFile (toneType) {
        var file = _.get(self.formOptions, toneType + "Custom");

        // api does not handle space characters in filenames
        var name = (file.name || "").replace(/\s/g, "_");

        // first, upload document to get a file url
        return OvhApiMe.Document().Lexi().upload(name, file).then(function (doc) {
            // second upload the file with given url
            return apiService.Lexi().uploadTones({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, {
                type: toneType,
                url: doc.getUrl
            }).$promise.then(function (result) {
                return voipServiceTask.startPolling($stateParams.billingAccount, $stateParams.serviceName, result.taskId, {
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
        });
    }

    /* -----  End of HELPERS  ------ */

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onTonesFormSubmit = function () {
        var savePromises = [];
        var otherTypes = {};

        self.loaders.save = true;

        ["ringback", "onHold", "endCall"].forEach(function (toneType) {
            if (_.get(self.formOptions, toneType) === "Custom sound") {
                savePromises.push(uploadFile(toneType));
            } else {
                _.set(otherTypes, toneType, _.get(self.formOptions, toneType));
            }
        });

        // save other types (types without custom sound)
        if (!_.isEmpty(otherTypes)) {
            savePromises.push(apiService.Lexi().saveTones({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, otherTypes).$promise);
        }

        return $q.all(savePromises).then(function () {
            self.tones = angular.copy(_.pick(self.formOptions, ["ringback", "onHold", "endCall"]));
            Toast.success($translate.instant("telephony_alias_configuration_tones_old_pabx_save_success"));
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_tones_old_pabx_save_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loaders.save = false;
        });
    };

    self.onCancelBtnClick = function () {
        self.formOptions = angular.copy(self.tones);
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loaders.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);
            apiService = self.number.feature.featureType === "easyPabx" ? OvhApiTelephonyEasyPabx : OvhApiTelephonyMiniPabx;

            return fetchTones().then(function (result) {
                self.tones = result;
                self.formOptions = angular.copy(self.tones);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_tones_old_pabx_load_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loaders.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */
});
