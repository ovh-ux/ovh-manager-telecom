angular.module("managerApp").controller("TelecomTelephonyLineCallsDisplayNumberCtrl", function ($scope, $stateParams, $translate, $timeout, TelephonyLineOptions, Toast, ToastError, TelephonyMediator) {
    "use strict";

    var self = this;

    function getLineOptions () {
        return TelephonyLineOptions.Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (options) {
            self.options = _.isObject(options) ? options : {};
            return options;
        }, function () {
            return new ToastError($translate.instant("telephony_line_actions_line_calls_display_number_read_error"));
        });
    }

    function init () {
        self.isLoading = true;
        self.form = {
            identificationRestriction: undefined,
            displayedService: undefined
        };

        $scope.$watch("LineDisplayNumberCtrl.form.identificationRestriction", function () {
            if (self.form.identificationRestriction) {
                self.form.displayedService = angular.copy(self.displayedService);
            }
        });

        return getLineOptions().then(function (options) {
            self.identificationRestriction = _.get(options, "identificationRestriction");
            self.form.identificationRestriction = self.identificationRestriction;
        }).then(function () {
            return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
                return group.getLine($stateParams.serviceName);
            });
        }).then(function (line) {
            self.displayedService = line;
            self.form.displayedService = angular.copy(self.displayedService);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.getServiceLabel = function (service) {
        if (service.description && service.serviceName !== service.description) {
            return service.serviceName + " (" + service.description + ")";
        }
        return service.serviceName;
    };

    self.onChooseService = function (service) {
        self.form.displayedService = service;
    };

    self.hasChanges = function () {
        return !angular.equals(self.displayedService, self.form.displayedService) ||
               self.identificationRestriction !== self.form.identificationRestriction;
    };

    self.reset = function () {
        // $timeout is here so flat-checkbox is corretly refreshed ...
        $timeout(function () {
            self.form.displayedService = angular.copy(self.displayedService);
            self.form.identificationRestriction = self.identificationRestriction;
        });
    };

    self.update = function () {
        var data = {
            identificationRestriction: self.form.identificationRestriction
        };

        if (!data.identificationRestriction && _.get(self.form, "displayedService.serviceName")) {
            data.displayNumber = _.get(self.form, "displayedService.serviceName");
        }

        self.isUpdating = true;
        return TelephonyLineOptions.Lexi().update({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, data).$promise.then(function () {
            self.identificationRestriction = self.form.identificationRestriction;
            self.displayedService = angular.copy(self.form.displayedService);
            Toast.success($translate.instant("telephony_line_actions_line_calls_display_number_write_success"));
        }, function () {
            return new ToastError($translate.instant("telephony_line_actions_line_calls_display_number_write_error"));
        }).finally(function () {
            self.isUpdating = false;
        });
    };

    init();
});
