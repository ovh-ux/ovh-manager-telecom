angular.module("managerApp").controller("TelecomTelephonyLineAnswerDefaultVoicemailCtrl", function ($scope, $stateParams, $q, $timeout, $filter, ToastError, OvhApiTelephony) {
    "use strict";

    var self = this;

    function fetchLines () {
        return OvhApiTelephony.Line().Aapi().get().$promise.then(function (result) {
            return _.filter(_.flatten(_.pluck(result, "lines")), { serviceType: "line" });
        });
    }

    function fetchFax () {
        return OvhApiTelephony.Fax().Aapi().getServices().$promise.then(function (result) {
            return _.filter(result, { type: "FAX" });
        });
    }

    function fetchOptions () {
        return OvhApiTelephony.Line().Lexi().getOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function init () {
        self.numbers = [];
        self.options = {};
        self.defaultVoicemail = null;
        self.form = {
            email: null
        };

        self.loading = true;
        return $q.all({
            lines: fetchLines(),
            fax: fetchFax(),
            options: fetchOptions()
        }).then(function (result) {
            self.numbers = result.lines.concat(result.fax);
            self.options = result.options;
            self.defaultVoicemail = self.options.defaultVoicemail;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    self.saveDefaultVoicemail = function () {
        self.saving = true;
        var save = OvhApiTelephony.Line().Lexi().setOptions({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, self.options).$promise;

        self.success = false;
        return $q.all([
            $timeout(angular.noop, 1000), // avoid clipping
            save
        ]).then(function () {
            self.defaultVoicemail = self.options.defaultVoicemail;
            self.success = true;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.saving = false;
        });
    };

    self.formatNumber = function (number) {
        var formatted = $filter("phoneNumber")(number.serviceName);
        if (number.description) {
            return number.description === number.serviceName ? formatted : formatted + " " + number.description;
        } else if (number.label) {
            return number.label === number.serviceName ? formatted : formatted + " " + number.label;
        }
        return formatted;

    };

    init();
});
