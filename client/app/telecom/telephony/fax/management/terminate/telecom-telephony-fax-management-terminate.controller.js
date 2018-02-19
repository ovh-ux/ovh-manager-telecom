angular.module("managerApp").controller("TelecomTelephonyFaxManagementTerminateCtrl", function ($q, $stateParams, $translate, TelephonyMediator, voipServiceOfferTask, Toast, telephonyBulk) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        terminate: false
    };

    self.model = {
        reason: null,
        details: null
    };

    self.fax = null;
    self.terminateTask = null;
    self.availableReasons = null;
    self.nextBillDate = moment().add(1, "month").startOf("month").toDate();

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onTerminateFormSubmit = function () {
        self.loading.terminate = true;

        return self.fax.terminate().then(function () {
            return getTerminateTask();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_group_fax_management_terminate_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.terminate = false;
        }).then(function () {
            Toast.success($translate.instant("telephony_group_fax_management_terminate_success"));
        });
    };

    self.onCancelTerminationClick = function () {
        self.loading.cancel = true;

        return self.fax.cancelTermination().then(function () {
            self.terminateTask = null;
            Toast.success($translate.instant("telephony_group_fax_management_terminate_cancel_success"));
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_group_fax_management_terminate_cancel_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.cancel = false;
        });
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function getAvailableReasons () {
        return TelephonyMediator.getApiModelEnum("telephony.TerminationReasonEnum").then(function (enumValues) {
            self.availableReasons = _.map(enumValues, function (reason) {
                return {
                    label: $translate.instant("telephony_group_fax_management_terminate_reason_label_" + reason),
                    value: reason
                };
            });
        });
    }

    function getTerminateTask () {
        return voipServiceOfferTask.getTaskInStatus(self.fax.billingAccount, self.fax.serviceName, ["todo", "doing"], "termination").then(function (task) {
            self.terminateTask = task;
        });
    }

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);

            return $q.allSettled([
                getAvailableReasons(),
                getTerminateTask()
            ]);
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_fax_loading_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

    /* =====================================
    =                  BULK                =
    ====================================== */

    self.bulkDatas = {
        infos: {
            name: "faxTermination",
            actions: [{
                name: "termination",
                route: "/telephony/{billingAccount}/service/{serviceName}",
                method: "DELETE",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["fax", "voicefax"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        var data = {
            reason: self.reason,
            details: self.details
        };

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_group_fax_management_terminate_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_group_fax_management_terminate_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_group_fax_management_terminate_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        self.$onInit();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_group_fax_management_terminate_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----       End of BULK      ------ */
});
