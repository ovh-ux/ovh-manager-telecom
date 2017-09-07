angular.module("managerApp").controller("TelecomTelephonyLineConvertCtrl", function ($stateParams, $translate, OvhApiTelephony, TelephonyMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    function init () {
        self.isLoading = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getLine($stateParams.serviceName);
        }).then(function (line) {
            self.line = line;
            return line.getConvertionTask().then(function (task) {
                self.task = task;
            });
        }).then(function () {
            return self.line.isIncludedInXdslPack().then(function (inPack) {
                self.isInXdslPack = inPack;
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.convertToNumber = function () {
        self.isConverting = true;
        return OvhApiTelephony.Line().Lexi().convertToNumber({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return self.line.getConvertionTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_line_convert_convert_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isConverting = false;
        });
    };

    self.cancelConvertToNumber = function () {
        self.isCancelling = true;
        return OvhApiTelephony.Line().Lexi().cancelConvertToNumber({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return self.line.getConvertionTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_line_convert_cancel_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isCancelling = false;
        });
    };

    init();
});
