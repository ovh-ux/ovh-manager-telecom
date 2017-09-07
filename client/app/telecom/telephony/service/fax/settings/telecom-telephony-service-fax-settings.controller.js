angular.module("managerApp").controller("TelecomTelephonyServiceFaxSettingsCtrl", function ($q, $stateParams, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchEnums () {
        return OvhApiTelephony.Lexi().schema({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (schema) {
            return {
                quality: schema.models["telephony.FaxQualityEnum"].enum,
                sendingTries: schema.models["telephony.FaxSendingTries"].enum,
                mailFormat: schema.models["telephony.FaxMailFormatEnum"].enum
            };
        });
    }

    function fetchSettings () {
        return OvhApiTelephony.Fax().Lexi().getSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function refreshSettings () {
        OvhApiTelephony.Fax().Lexi().resetCache();
        OvhApiTelephony.Fax().Lexi().resetQueryCache();
        return fetchSettings().then(function (settings) {
            self.settings = settings;
            _.assign(
                self.generalOptionsForm,
                _.pick(settings, ["faxQuality", "faxMaxCall"]),
                function (objectValue, sourceValue) {
                    return sourceValue.toString();
                }
            );
            _.assign(self.notificationOptionsForm, _.pick(settings, ["fromName", "fromEmail", "mailFormat"]));
        });
    }

    function pickEditableSettings (settings) {
        return _.pick(settings, [
            "fromName",
            "faxQuality",
            "faxMaxCall",
            "fromEmail",
            "redirectionEmail",
            "mailFormat"
        ]);
    }

    self.generalOptionsChanged = function () {
        return self.generalOptionsForm.faxQuality !== self.settings.faxQuality ||
            _.parseInt(self.generalOptionsForm.faxMaxCall) !== self.settings.faxMaxCall;
    };

    self.notificationOptionsChanged = function () {
        return self.notificationOptionsForm.fromName !== self.settings.fromName ||
            self.notificationOptionsForm.fromEmail !== self.settings.fromEmail ||
            self.notificationOptionsForm.mailFormat !== self.settings.mailFormat;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cancelAddAddressesToNotifyForm = function () {
        self.addressesToNotifyForm.email = null;
        self.addressesToNotifyForm.isShown = false;
    };

    self.updateGeneralOptions = function () {
        var settings = pickEditableSettings(self.settings);
        _.assign(settings, _.pick(self.generalOptionsForm, ["faxQuality", "faxMaxCall"]));

        self.generalOptionsForm.isUpdating = true;

        var update = OvhApiTelephony.Fax().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        return $q.all({
            noop: $timeout(angular.noop, 1000),
            update: update
        })
            .then(function () {
                return refreshSettings();
            })
            .then(function () {
                self.generalOptionsForm.isSuccess = true;
                $timeout(function () {
                    self.generalOptionsForm.isSuccess = false;
                }, 3000);
            })
            .catch(function (err) {
                return new ToastError(err);
            })
            .finally(function () {
                self.generalOptionsForm.isUpdating = false;
            });
    };

    self.updateNotificationOptions = function () {
        var settings = pickEditableSettings(self.settings);
        _.assign(settings, _.pick(self.notificationOptionsForm, ["fromName", "fromEmail", "mailFormat"]));

        self.notificationOptionsForm.isUpdating = true;

        var update = OvhApiTelephony.Fax().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        return $q.all({
            noop: $timeout(angular.noop, 1000),
            update: update
        })
            .then(function () {
                return refreshSettings();
            })
            .then(function () {
                self.notificationOptionsForm.isSuccess = true;
                $timeout(function () {
                    self.notificationOptionsForm.isSuccess = false;
                }, 3000);
            })
            .catch(function (err) {
                return new ToastError(err);
            })
            .finally(function () {
                self.notificationOptionsForm.isUpdating = false;
            });
    };

    self.removeRedirectionEmail = function (email) {
        var settings = pickEditableSettings(self.settings);
        _.pull(settings.redirectionEmail, email);

        self.addressesToNotifyForm.isRemoving = true;

        var update = OvhApiTelephony.Fax().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        return $q.all({
            noop: $timeout(angular.noop, 1000),
            update: update
        })
            .then(function () {
                return refreshSettings();
            })
            .catch(function (err) {
                return new ToastError(err);
            })
            .finally(function () {
                self.addressesToNotifyForm.isRemoving = false;
            });
    };

    self.addRedirectionEmail = function () {
        var settings = pickEditableSettings(self.settings);
        settings.redirectionEmail.push(self.addressesToNotifyForm.redirectionEmail);
        settings.redirectionEmail = _.uniq(settings.redirectionEmail);

        self.addressesToNotifyForm.isAdding = true;

        var update = OvhApiTelephony.Fax().Lexi().setSettings({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, settings).$promise;

        return $q.all({
            noop: $timeout(angular.noop, 500),
            update: update
        })
            .then(function () {
                return refreshSettings();
            })
            .then(function () {
                self.addressesToNotifyForm.redirectionEmail = null;
                self.addressesToNotifyForm.isShown = false;
            })
            .catch(function (err) {
                return new ToastError(err);
            })
            .finally(function () {
                self.addressesToNotifyForm.isAdding = false;
            });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: true
        };

        self.enums = {};
        self.settings = {};

        self.generalOptionsForm = {
            faxQuality: null,
            faxMaxCall: null,
            isUpdating: false,
            isSuccess: false
        };

        self.notificationOptionsForm = {
            fromName: null,
            fromEmail: null,
            isUpdating: false,
            isSuccess: false
        };

        self.addressesToNotifyForm = {
            email: null,
            threshold: 5,
            isShown: false,
            isAdding: false,
            isRemoving: false
        };

        return $q.all({
            enums: fetchEnums(),
            settings: refreshSettings()
        }).then(function (results) {
            self.enums = results.enums;
        }).catch(function (err) {
            self.settings = null;
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
