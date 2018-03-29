angular.module("managerApp").controller("TelecomTelephonyLineTerminateCancelCtrl", function ($stateParams, $state, TelephonyMediator, OvhApiTelephony, Toast, $translate, $filter, $q) {
    "use strict";

    var self = this;

    self.loading = {
        init: true,
        cancelTerminate: false
    };

    self.taskDetails = {};

    self.cancelTerminate = function () {
        self.loading.cancelTerminate = true;
        if (self.taskDetails.executionDate) {
            return OvhApiTelephony.Service().v6().cancelTermination({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, null).$promise.then(function () {
                Toast.success($translate.instant("telephony_group_line_cancel_terminating_ok"));
                $state.go("^");
            }).catch(function () {
                Toast.error($translate.instant("telephony_group_line_cancel_terminating_ko"));
            }).finally(function () {
                self.loading.cancelTerminate = false;
            });
        }
        return $q.when(null);
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);
        }).then(function () {

            return OvhApiTelephony.Service().OfferTask().v6().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                action: "termination",
                status: "todo"
            }).$promise.then(function (tasks) {

                if (tasks.length === 0) {
                    return $state.go("^");
                }

                self.taskDetails = {};

                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    action: "termination",
                    status: "todo",
                    taskId: tasks[0]
                }).$promise.then(function (taskDetails) {
                    taskDetails.executionDate = $filter("date")(taskDetails.executionDate, "shortDate");
                    self.taskDetails = taskDetails;
                    return self.taskDetails;
                });

            }).catch(function () {
                return $state.go("^");
            });
        }).catch(function (error) {
            Toast.error($translate.instant("telephony_group_line_terminating_ko", { error: error.data.message }));
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
