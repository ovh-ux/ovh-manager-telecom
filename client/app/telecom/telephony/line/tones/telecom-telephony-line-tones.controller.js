angular.module("managerApp").controller("TelecomTelephonyLineTonesCtrl", function ($state, $stateParams, $q, $timeout, $translate, OvhApiTelephony, ToastError, OvhApiMe, TelephonyMediator) {
    "use strict";

    var self = this;
    var disabledFeatureError = {};

    function checkIfFeatureEnabled () {
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getLine($stateParams.serviceName);
        }).then(function (line) {
            if (line.isIndividual()) {
                $state.go("telecom.telephony.line");
                return $q.reject(disabledFeatureError);
            }
            return line;
        });
    }

    function fetchTones () {
        return OvhApiTelephony.Line().v6().getTones({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function init () {
        self.isLoading = true;
        return checkIfFeatureEnabled().then(fetchTones().then(function (tones) {
            self.tonesEnum = ["None", "Predefined 1", "Predefined 2", "Custom sound"];
            self.tones = tones;
            self.tonesForm = angular.copy(self.tones);
        })).catch(function (err) {
            return err === disabledFeatureError ? err : new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.getToneTypeLabel = function (toneType) {
        var label = "";
        if (angular.isString(toneType)) {
            var toneId = _.snakeCase(toneType);
            label = $translate.instant("telephony_line_tones_type_" + toneId);
        }
        return label;
    };

    self.filterValidExtension = function (file) {
        var validExtensions = ["aiff", "au", "flac", "ogg", "mp3", "wav", "wma"];
        var fileName = file ? file.name : "";
        var found = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });
        if (!found) {
            ToastError($translate.instant("telephony_line_tones_choose_file_type_error"));
        }
        return found;
    };

    self.updateTone = function (toneType) {
        // only update tone if it is not a file upload and if tone changed
        if (self.tonesForm[toneType] !== "Custom sound" && self.tonesForm[toneType] !== self.tones[toneType]) {
            var tonesParam = self.tones;
            _.assign(tonesParam, _.pick(self.tonesForm, toneType));
            self.tonesForm[toneType + "Updating"] = true;
            return $q.all([
                $timeout(angular.noop, 500), // avoid clipping
                OvhApiTelephony.Line().v6().changeTones({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, tonesParam).$promise.then(function () {
                    // since there are no errors, assume tone is correctly updated
                    self.tones[toneType] = self.tonesForm[toneType];
                })
            ]).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.tonesForm[toneType + "Updating"] = false;
            });
        }
        return $q.when(true);
    };

    self.uploadTone = function (toneType) {
        self.tonesForm[toneType + "Uploading"] = true;

        // upload document
        return OvhApiMe.Document().v6().upload(
            self.tonesForm[toneType + "File"].name,
            self.tonesForm[toneType + "File"]
        ).then(function (doc) {
            // upload tone
            return OvhApiTelephony.Line().v6().toneUpload({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, {
                type: toneType,
                url: doc.getUrl
            }).$promise;
        }).then(function () {
            self.tonesForm[toneType + "UploadSuccess"] = true;

            // since there are no errors, assume tone is correctly updated
            self.tones[toneType] = self.tonesForm[toneType];
            $timeout(function () {
                self.tonesForm[toneType + "File"] = null;
                self.tonesForm[toneType + "UploadSuccess"] = false;
            }, 3000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.tonesForm[toneType + "Uploading"] = false;
        });
    };

    init();
});
