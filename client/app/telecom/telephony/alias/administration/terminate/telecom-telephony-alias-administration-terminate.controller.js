angular.module("managerApp").controller("TelecomTelephonyAliasAdministrationTerminateCtrl", function ($q, $stateParams, $translate, OvhApiTelephony, TelephonyMediator, Toast, ToastError, telephonyBulk) {
    "use strict";

    var self = this;

    function getTerminationReasons () {
        return TelephonyMediator.getApiScheme().then(function (schema) {
            return schema.models["telephony.TerminationReasonEnum"].enum;
        });
    }

    function getNumber () {
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getNumber($stateParams.serviceName);
        });
    }

    function getTerminationTask () {
        return getNumber().then(function (number) {
            return number.getTerminationTask();
        });
    }

    function init () {
        self.isLoading = true;
        $q.all({
            reason: getTerminationReasons(),
            task: getTerminationTask(),
            number: getNumber()
        }).then(function (result) {
            self.reasonEnum = result.reason;
            self.task = result.task;
            self.number = result.number;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.hasValidReason = function () {
        if (self.reason === "missingOptions" || self.reason === "other") {
            return self.details;
        }
        return self.reason;
    };

    self.terminate = function () {
        self.isTerminating = true;
        OvhApiTelephony.Service().Lexi().delete({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            details: self.details,
            reason: self.reason
        }).$promise.then(function () {
            return getTerminationTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_alias_administration_terminate_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isTerminating = false;
        });
    };

    self.cancelTermination = function () {
        self.isCancelling = true;
        OvhApiTelephony.Service().Lexi().cancelTermination({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return getTerminationTask();
        }).then(function (task) {
            self.task = task;
            Toast.success($translate.instant("telephony_alias_administration_cancel_termination_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isCancelling = false;
        });
    };

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "terminate",
            actions: [{
                name: "service",
                route: "/telephony/{billingAccount}/service/{serviceName}",
                method: "DELETE",
                params: null
            }]
        }
    };

    self.getBulkParams = function () {
        return _.pick(self, ["details", "reason"]);
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_alias_administration_terminate_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_alias_administration_terminate_bulk_some_success", {
                count: bulkResult.success.length

            }),
            error: $translate.instant("telephony_alias_administration_terminate_bulk_error")
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
        Toast.error([$translate.instant("telephony_alias_administration_terminate_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    init();
});
