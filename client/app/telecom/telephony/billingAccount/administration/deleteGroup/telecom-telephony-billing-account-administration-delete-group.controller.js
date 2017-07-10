angular.module("managerApp").controller("TelecomTelephonyBillingAccountAdministrationDeleteGroup", function ($stateParams, $q, $translate, Telephony, Toast, ToastError) {
    "use strict";

    var self = this;

    function getOfferTaskList (billingAccount) {
        return Telephony.OfferTask().Lexi().query({
            billingAccount: billingAccount
        }).$promise.then(function (offerTaskIds) {
            return $q.all(_.map(offerTaskIds, function (id) {
                return Telephony.OfferTask().Lexi().get({
                    billingAccount: billingAccount,
                    taskId: id
                }).$promise;
            }));
        });
    }

    function fetchTerminationTask () {
        return getOfferTaskList($stateParams.billingAccount).then(function (offerTaskList) {
            self.task = _.head(_.filter(offerTaskList, { action: "termination", status: "todo", type: "offer" }));
            return self.task;
        });
    }

    function fetchGroup () {
        return Telephony.Lexi().get({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (group) {
            self.group = group;
        });
    }

    self.cancelTermination = function () {
        self.cancelling = true;
        return Telephony.Lexi().cancelTermination({
            billingAccount: $stateParams.billingAccount
        }, {}).$promise.then(function () {
            return fetchTerminationTask();
        }).then(function () {
            var groupName = self.group.description || self.group.billingAccount;
            return Toast.success($translate.instant("telephony_delete_group_cancel_success", { group: groupName }));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.cancelling = false;
        });
    };

    self.terminate = function () {
        self.deleting = true;
        return Telephony.Lexi().delete({
            billingAccount: $stateParams.billingAccount
        }, {}).$promise.then(function () {
            return fetchTerminationTask();
        }).then(function () {
            var groupName = self.group.description || self.group.billingAccount;
            return Toast.success($translate.instant("telephony_delete_group_delete_success", { group: groupName }));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.deleting = false;
        });
    };

    function init () {
        self.loading = true;
        self.loaded = false;
        self.task = null;
        self.group = null;
        self.cancelling = false;
        self.deleting = false;
        return $q.all({
            group: fetchGroup(),
            task: fetchTerminationTask()
        }).then(function () {
            self.loaded = true;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    }

    init();
});

