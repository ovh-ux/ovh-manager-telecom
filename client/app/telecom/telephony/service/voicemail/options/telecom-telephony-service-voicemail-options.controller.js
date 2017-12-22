angular.module("managerApp").controller("TelecomTelephonyServiceVoicemailOptionsCtrl", function ($scope, $stateParams, $q, $translate, $timeout, ToastError, OvhApiTelephony, OvhApiMe, telephonyBulk, Toast) {
    "use strict";

    var self = this;
    var removeRecord = null;

    function fetchEnums () {
        return OvhApiTelephony.Lexi().schema({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (schema) {
            return {
                audioFormat: schema.models["telephony.ServiceVoicemailAudioFormatEnum"].enum,
                mailOption: schema.models["telephony.ServiceVoicemailMailOptionEnum"].enum
            };
        });
    }

    function fetchSettings () {
        return OvhApiTelephony.Voicemail().Lexi().getSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchGreetings () {
        return OvhApiTelephony.Voicemail().Greetings().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (result) {
            if (result.length) {
                return $q.all({
                    greeting: OvhApiTelephony.Voicemail().Greetings().Lexi().get({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        id: result[0]
                    }).$promise,
                    download: OvhApiTelephony.Voicemail().Greetings().Lexi().download({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName,
                        id: result[0]
                    }).$promise.catch(function () {
                        // sometimes api fails to retrieve a download URL,
                        // since it's not blocking we don't want to reject an error
                        ToastError($translate.instant("telephony_line_answer_voicemail_options_recording_file_download_error"));
                        return { filename: null, url: null };
                    })
                }).then(function (data) {
                    var res = {};
                    _.assign(res, _.pick(data.greeting, ["dir", "id"]));
                    _.assign(res, _.pick(data.download, ["filename", "url"]));
                    return res;
                });
            }
            return null;
        });
    }

    function refreshSettings () {
        OvhApiTelephony.Voicemail().Lexi().resetCache();
        OvhApiTelephony.Voicemail().Lexi().resetQueryCache();
        return fetchSettings().then(function (settings) {
            self.settings = settings;
            _.assign(self.recordingForm, _.pick(settings, ["doNotRecord"]));
            _.assign(self.notificationForm, _.pick(settings, ["audioFormat", "keepMessage", "fromName", "fromEmail"]));
        });
    }

    function refreshGreetings () {
        OvhApiTelephony.Voicemail().Greetings().Lexi().resetCache();
        OvhApiTelephony.Voicemail().Greetings().Lexi().resetQueryCache();
        return fetchGreetings().then(function (greetings) {
            self.greetings = greetings;
            _.assign(self.recordingForm, _.pick(greetings, ["filename", "url", "dir"]));
        });
    }

    function refreshAll () {
        return $q.all([refreshSettings(), refreshGreetings()]);
    }

    function pickEditableSettings (settings) {
        return _.pick(settings, ["audioFormat", "doNotRecord", "forcePassword", "fromEmail",
            "fromName", "keepMessage", "redirectionEmails"]);
    }

    function init () {
        self.loading = true;
        self.enums = {};
        self.settings = {}; // current settings from API
        self.greetings = {};

        // recording options form
        self.recordingForm = {
            doNotRecord: null,
            uploadedFile: null,
            dir: "greet",
            filename: null,
            url: null,
            isUpdating: false,
            isSuccess: false
        };

        // notification add email form
        self.emailForm = {
            email: null,
            type: null,
            isShown: false,
            isAdding: false,
            isRemoving: false
        };

        // notification options form
        self.notificationForm = {
            audioFormat: null,
            keepMessage: null,
            fromName: null,
            fromEmail: null,
            isUpdating: false,
            isSuccess: false
        };

        return $q.all({
            enums: fetchEnums(),
            data: refreshAll()
        }).then(function (result) {
            self.enums = result.enums;
        }).catch(function (err) {
            self.settings = null;
            self.greetings = null;
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    // true if user made some changes in notification options, false otherwise
    self.notificationChanged = function () {
        return self.notificationForm.audioFormat !== self.settings.audioFormat ||
               self.notificationForm.keepMessage !== self.settings.keepMessage ||
               self.notificationForm.fromName !== self.settings.fromName ||
               self.notificationForm.fromEmail !== self.settings.fromEmail;
    };

    self.recordingChanged = function () {
        return (self.recordingForm.doNotRecord !== self.settings.doNotRecord) || self.recordingForm.uploadedFile || removeRecord;
    };

    self.checkValidAudioExtention = function (file) {
        var validExtensions = ["aiff", "au", "flac", "ogg", "mp3", "wav", "wma"];
        var fileName = file ? file.name : "";
        var found = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });
        if (!found) {
            ToastError($translate.instant("telephony_line_answer_voicemail_options_recording_file_invalid"));
        }
        return found;
    };

    self.updateRecording = function () {

        // update changes
        var settings = pickEditableSettings(self.settings);
        _.assign(settings, _.pick(self.recordingForm, ["doNotRecord"]));

        var update = function () {
            var promises = {
                settings: OvhApiTelephony.Voicemail().Lexi().setSettings({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }, settings).$promise.then(function () {
                    return refreshSettings();
                })
            };

            if (removeRecord) {
                promises.greetings = OvhApiTelephony.Voicemail().Greetings().Lexi().delete({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: removeRecord
                }).$promise.then(function () {
                    removeRecord = null;
                });
            }

            return $q.all(promises);
        };

        var uploadFile = $timeout(angular.noop, 1000);
        if (self.recordingForm.uploadedFile) {
            uploadFile = function () {
                return OvhApiMe.Document().Lexi().upload(
                    self.recordingForm.uploadedFile.name,
                    self.recordingForm.uploadedFile
                ).then(function (doc) {
                    return OvhApiTelephony.Voicemail().Greetings().Lexi().create({
                        billingAccount: $stateParams.billingAccount,
                        serviceName: $stateParams.serviceName
                    }, {
                        documentId: doc.id,
                        dir: self.recordingForm.dir
                    }).$promise;
                }).then(function () {
                    /**
                     * This is not sexy but there are some delay for greetings to be refreshed.
                     * So we need to loop some queries until data is up to date after file upload.
                     */
                    var oldGreetings = angular.copy(self.greetings);
                    var maxRetries = 10; // avoid deadly infinite loop
                    var refresh = function () {
                        return refreshAll().then(function () {
                            if (--maxRetries < 0) {
                                return $q.reject("Unable to retrieve uploaded file");
                            } else if (!self.greetings ||
                                       (oldGreetings && oldGreetings.filename === self.greetings.filename)) {
                                return $timeout(refresh, 1500);
                            }
                            return $q.when(null);
                        });
                    };
                    return refresh();
                });
            };
        }

        self.recordingForm.isUpdating = true;
        self.cancelAddEmail();
        self.recordingForm.isSuccess = false;

        return update().then(uploadFile).then(function () {
            self.recordingForm.isSuccess = true;
            self.recordingForm.uploadedFile = null;
            $timeout(function () {
                self.recordingForm.isSuccess = false; // reset form
            }, 3000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.recordingForm.isUpdating = false;
        });
    };


    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "settings",
            actions: [{
                name: "settings",
                route: "/telephony/{billingAccount}/voicemail/{serviceName}/settings",
                method: "PUT",
                params: null
            }]
        }
    };

    self.getBulkParams = function () {
        var data = {};
        _.assign(data, _.pick(self.notificationForm, ["audioFormat", "fromEmail", "fromName", "keepMessage"]));
        _.assign(data, _.pick(self.recordingForm, ["doNotRecord", "forcePassword"]));
        _.assign(data, _.pick(self.settings, ["redirectionEmails"]));
        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_answer_voicemail_options_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_answer_voicemail_options_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_answer_voicemail_options_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        // reset initial values to be able to modify again the options
        OvhApiTelephony.Line().Lexi().resetAllCache();

        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_answer_voicemail_options_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    // update notification options
    self.updateSettings = function () {

        // update changes
        var settings = pickEditableSettings(self.settings);
        _.assign(settings, _.pick(self.notificationForm, ["audioFormat", "keepMessage", "fromName", "fromEmail"]));

        self.notificationForm.isUpdating = true;
        self.cancelAddEmail();

        var update = OvhApiTelephony.Voicemail().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        return $q.all({
            noop: $timeout(angular.noop, 1000), // avoid clipping
            update: update
        }).then(function () {
            return refreshSettings();
        }).then(function () {
            self.notificationForm.isSuccess = true;
            $timeout(function () {
                self.notificationForm.isSuccess = false; // reset form
            }, 3000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.notificationForm.isUpdating = false;
        });
    };

    // delete a notification email
    self.removeEmail = function (redirection) {

        // update changes
        var settings = pickEditableSettings(self.settings);
        _.remove(settings.redirectionEmails, {
            email: redirection.email,
            type: redirection.type
        });

        self.emailForm.isRemoving = true;
        redirection.removing = true;

        var update = OvhApiTelephony.Voicemail().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        $q.all({
            noop: $timeout(angular.noop, 1000), // avoid clipping
            update: update
        }).then(function () {
            return refreshSettings();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.emailForm.isRemoving = false;
        });
    };

    // add a new notification email
    self.addEmail = function () {

        // update changes
        var settings = pickEditableSettings(self.settings);
        settings.redirectionEmails.push({
            email: self.emailForm.email,
            type: self.emailForm.type
        });

        self.emailForm.isAdding = true;

        var update = OvhApiTelephony.Voicemail().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        $q.all({
            noop: $timeout(angular.noop, 500), // avoid clipping
            update: update
        }).then(function () {
            return refreshSettings();
        }).then(function () {
            self.emailForm.email = null;
            self.emailForm.type = null;
            self.emailForm.isShown = false;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.emailForm.isAdding = false;
        });
    };

    // cancel creation of new notification email
    self.cancelAddEmail = function () {
        self.emailForm.email = null;
        self.emailForm.type = null;
        self.emailForm.isShown = false;
    };

    self.removeRecordSound = function () {
        self.settings.annouceMessage = null;
        removeRecord = self.greetings.id;
        self.greetings = null;
    };

    init();
});
