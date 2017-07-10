angular.module("managerApp").controller("TelecomSmsSendersCtrl", function ($stateParams, $q, $filter, $timeout, $uibModal, $translate, Sms, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchSenders () {
        return Sms.Senders().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (sendersIds) {
            return $q.all(_.map(_.chunk(sendersIds, 50), function (chunkIds) {
                return Sms.Senders().Lexi().getBatch({
                    serviceName: $stateParams.serviceName,
                    sender: chunkIds.join("|")
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    }

    self.getSelection = function () {
        return _.filter(self.senders.raw, function (sender) {
            return sender && sender.type !== "virtual" && self.senders.selected && self.senders.selected[sender.sender];
        });
    };

    function resetAllCache () {
        Sms.Senders().Lexi().resetAllCache();
        Sms.VirtualNumbers().Lexi().resetAllCache();
    }

    self.canEdit = function (sender) {
        if (sender.status === "waitingValidation") {
            return false;
        }
        return sender.type === "virtual" ? sender.serviceInfos.status !== "expired" : true;
    };

    self.canTerminate = function (sender) {
        return sender.type === "virtual" &&
            sender.serviceInfos.canDeleteAtExpiration &&
            sender.serviceInfos.status !== "expired";
    };

    self.getSendersDeletedAtExpiration = function () {
        return _.filter(self.senders.raw, "serviceInfos.renew.deleteAtExpiration");
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        self.senders.isLoading = true;
        resetAllCache();
        return fetchSenders().then(function (senders) {
            return $q.all(_.map(senders, function (sender) {
                sender.serviceInfos = null;
                if (sender.type === "virtual") {
                    var number = "00" + _.trimLeft(sender.sender, "+");
                    return Sms.VirtualNumbers().Lexi().getVirtualNumbersServiceInfos({
                        number: number
                    }).$promise.then(function (serviceInfos) {
                        sender.serviceInfos = serviceInfos;
                        return sender;
                    });
                }
                return $q.resolve(sender);

            })).then(function (sendersResult) {
                self.senders.raw = sendersResult;
                self.senders.hasExpiration = _.some(self.senders.raw, "serviceInfos.renew.deleteAtExpiration");
                self.applySorting();
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.senders.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.senders.raw);
        data = $filter("orderBy")(
            data,
            self.senders.orderBy,
            self.senders.orderDesc
        );
        self.senders.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.senders.orderBy === by) {
            self.senders.orderDesc = !self.senders.orderDesc;
        } else {
            self.senders.orderBy = by;
        }
        self.applySorting();
    };

    self.deleteSelectedSenders = function () {
        var senders = self.getSelection();
        var queries = senders.map(function (sender) {
            return Sms.Senders().Lexi().delete({
                serviceName: $stateParams.serviceName,
                sender: sender.sender
            }).$promise;
        });
        self.senders.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_senders_delete_senders_success"));
        return $q.all(queries).then(function () {
            self.senders.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.senders.isDeleting = false;
        });
    };

    self.edit = function (sender) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/senders/edit/telecom-sms-senders-edit.html",
            controller: "TelecomSmsSendersEditCtrl",
            controllerAs: "SendersEditCtrl",
            resolve: {
                sender: function () { return sender; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_senders_edit_sender_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.remove = function (sender) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/senders/remove/telecom-sms-senders-remove.html",
            controller: "TelecomSmsSendersRemoveCtrl",
            controllerAs: "SendersRemoveCtrl",
            resolve: {
                sender: function () { return sender; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_senders_remove_sender_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.terminate = function (sender) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/senders/terminate/telecom-sms-senders-terminate.html",
            controller: "TelecomSmsSendersTerminateCtrl",
            controllerAs: "SendersTerminateCtrl",
            resolve: {
                sender: function () { return sender; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_senders_terminate_sender_ko", { error: _.get(error, "msg.data.message") }));
            }
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.actions = [{
            name: "manage_blacklisted_senders",
            sref: "telecom.sms.senders.blacklisted",
            text: $translate.instant("sms_senders_manage_blacklisted")
        }];

        self.senders = {
            raw: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "sender",
            orderDesc: false,
            isLoading: false,
            isDeleting: false,
            hasExpiration: false
        };

        return self.refresh();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
