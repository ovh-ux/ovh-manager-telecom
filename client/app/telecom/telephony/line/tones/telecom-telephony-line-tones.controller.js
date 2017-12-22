angular.module("managerApp").controller("TelecomTelephonyLineTonesCtrl", function ($state, $stateParams, $q, $timeout, $translate, OvhApiTelephony, ToastError, OvhApiMe, TelephonyMediator, telephonyBulk, Toast) {
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
        return OvhApiTelephony.Line().Lexi().getTones({
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
            self.customToneUrl = {};
            self.bulkParameters = [];
            self.toneHandling = false;
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
        if (self.tonesForm[toneType] !== "Custom sound" && self.tonesForm[toneType] !== self.tones[toneType]) {
            // only update tone if it is not a file upload and if tone changed
            self.toneHandling = true;
            var tonesParam = self.tones;
            _.assign(tonesParam, _.pick(self.tonesForm, toneType));
            self.tonesForm[toneType + "Updating"] = true;
            return $q.all([
                $timeout(angular.noop, 500), // avoid clipping
                OvhApiTelephony.Line().Lexi().changeTones({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, tonesParam).$promise.then(function () {
                    // since there are no errors, assume tone is correctly updated
                    self.tones[toneType] = self.tonesForm[toneType];
                })
            ]).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.toneHandling = false;
                self.tonesForm[toneType + "Updating"] = false;
            });
        }
        return $q.when(true);
    };

    self.uploadTone = function (toneType) {
        self.toneHandling = true;
        self.tonesForm[toneType + "Uploading"] = true;

        // upload document
        return OvhApiMe.Document().Lexi().upload(
            self.tonesForm[toneType + "File"].name,
            self.tonesForm[toneType + "File"]
        ).then(function (doc) {
            self.customToneUrl[toneType] = doc.getUrl;

            // upload tone
            return OvhApiTelephony.Line().Lexi().toneUpload({
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
            self.toneHandling = false;
            self.tonesForm[toneType + "Uploading"] = false;
        });
    };

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "tones",
            actions: self.bulkActions || []
        }
    };

    self.getBulkParams = function (action) {
        return ~action.indexOf("toneUpload") ? self.bulkParameters[action.replace(/toneUpload/g, "")] : self.tones;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_tones_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_tones_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_tones_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_tones_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    self.checkNewTones = function () {
        self.bulkActions = [];
        if (self.customToneUrl.length) {
            var customTones = _.keys(_.pick(self.tones, function (val) {
                return val === "Custom sound";
            }));
            if (customTones.length) {
                _.map(customTones, function (item) {
                    self.bulkActions.push({
                        name: "toneUpload" + item,
                        route: "/telephony/{billingAccount}/line/{serviceName}/tones/toneUpload",
                        method: "POST",
                        params: null
                    });
                    self.bulkParameters[item] = {
                        type: item,
                        url: self.customToneUrl[item]
                    };
                });
            }
        }
        self.bulkActions.push({
            name: "tones",
            route: "/telephony/{billingAccount}/line/{serviceName}/tones",
            method: "PUT",
            params: null
        });
        self.bulkDatas.infos.actions = self.bulkActions;
    };

    init();
});
