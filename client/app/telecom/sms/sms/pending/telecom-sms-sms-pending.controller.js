angular.module("managerApp").controller("TelecomSmsSmsPendingCtrl", function ($stateParams, $q, $filter, $uibModal, $translate, $timeout, Sms, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchPendingSms () {
        return Sms.Jobs().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (pendingIds) {
            return $q.all(_.map(_.chunk(pendingIds, 50), function (chunkIds) {
                return Sms.Jobs().Lexi().getBatch({
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var results = _.pluck(_.flatten(chunkResult), "value");
                return _.each(results, function (sms) {
                    sms.scheduledDatetime = moment(sms.creationDatetime).add(sms.differedDelivery, "minutes").format();
                });
            });
        });
    }

    function fetchPendingSmsStatus (pttId) {
        return Sms.Jobs().Lexi().getPtts({
            ptt: pttId
        }).$promise.then(function (ptt) {
            return ptt.comment;
        }, function () {
            return false;
        });
    }

    function fetchPendingSmsWithStatus () {
        return fetchPendingSms().then(function (pending) {
            return $q.all(_.map(pending, function (sms) {
                return fetchPendingSmsStatus(sms.ptt).then(function (status) {
                    sms.status = status;
                });
            })).then(function () {
                return pending;
            });
        });
    }

    self.getSelection = function () {
        return _.filter(self.pending.paginated, function (pending) {
            return pending && self.pending.selected && self.pending.selected[pending.id];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        Sms.Jobs().Lexi().resetAllCache();
        self.pending.isLoading = true;
        return fetchPendingSmsWithStatus().then(function (pending) {
            self.pending.raw = angular.copy(pending);
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.pending.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.pending.raw);
        data = $filter("orderBy")(
            data,
            self.pending.orderBy,
            self.pending.orderDesc
        );
        self.pending.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.pending.orderBy === by) {
            self.pending.orderDesc = !self.pending.orderDesc;
        } else {
            self.pending.orderBy = by;
        }
        self.applySorting();
    };

    self.read = function (pendingSms) {
        self.loading.read = true;

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/pending/read/telecom-sms-sms-pending-read.html",
            controller: "TelecomSmsSmsPendingReadCtrl",
            controllerAs: "PendingReadCtrl",
            resolve: {
                pendingSms: function () { return pendingSms; }
            }
        });

        modal.rendered.then(function () {
            self.loading.read = false;
        });

        return modal;
    };

    self.remove = function (pendingSms) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/pending/remove/telecom-sms-sms-pending-remove.html",
            controller: "TelecomSmsSmsPendingRemoveCtrl",
            controllerAs: "PendingRemoveCtrl",
            resolve: {
                pendingSms: function () { return pendingSms; }
            }
        });

        modal.result.then(function () {
            self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_pending_ko", { error: error.message }));
            }
        });

        return modal;
    };

    self.cancelAll = function () {
        self.loading.cancelAll = true;

        return $q.all([
            $timeout(angular.noop, 1000)
        ].concat(_.each(self.pending.raw, function (sms) {
            return Sms.Jobs().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: sms.id
            }).$promise;
        }))).then(function () {
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.cancelAll = false;
        });
    };

    self.cancelSelectedPending = function () {
        var pendings = self.getSelection();
        var queries = pendings.map(function (pending) {
            return Sms.Jobs().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: pending.id
            }).$promise;
        });
        self.pending.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_sms_pending_cancel_success"));
        return $q.all(queries).then(function () {
            self.pending.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.pending.isDeleting = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            read: false,
            cancelAll: false
        };

        self.pending = {
            raw: null,
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "creationDatetime",
            orderDesc: false,
            isLoading: false,
            isDeleting: false
        };

        self.refresh();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
