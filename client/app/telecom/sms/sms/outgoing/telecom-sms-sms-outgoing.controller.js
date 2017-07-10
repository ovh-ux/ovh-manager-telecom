angular.module("managerApp").controller("TelecomSmsSmsOutgoingCtrl", function ($scope, $stateParams, $q, $filter, $timeout, $window, $uibModal, $translate, Sms, User, debounce, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchOutgoingSms () {
        var sender = self.outgoing.filterBy.sender || null;
        if (sender === $translate.instant("sms_sms_outgoing_number_allowed_response")) {
            sender = "";
        }
        return Sms.Outgoing().Lexi().query({
            serviceName: $stateParams.serviceName,
            receiver: self.outgoing.filterBy.receiver || null,
            sender: sender
        }).$promise.then(function (outgoing) {
            return _.sortBy(outgoing).reverse();
        });
    }

    function fetchServiceInfos () {
        return Sms.Lexi().getServiceInfos({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchOutgoingSmsHlr (sms) {
        return Sms.Outgoing().Lexi().getHlr({
            serviceName: $stateParams.serviceName,
            id: sms.id
        }).$promise.then(function (voidResponse) {
            return voidResponse;
        }, function () {
            return false;
        });
    }

    function resetAllCache () {
        Sms.Outgoing().Lexi().resetAllCache();
        Sms.Jobs().Lexi().resetAllCache();
    }

    self.getSelection = function () {
        return _.filter(self.outgoing.paginated, function (outgoing) {
            return outgoing && self.outgoing.selected && self.outgoing.selected[outgoing.id];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.getDetails = function (item) {
        self.outgoing.isLoading = true;
        return Sms.Outgoing().Lexi().get({
            serviceName: $stateParams.serviceName,
            id: item
        }).$promise.then(function (outgoing) {
            if (_.isEmpty(outgoing.sender)) {
                outgoing.isShortNumber = true;
                outgoing.sender = $translate.instant("sms_sms_outgoing_number_allowed_response");
            }
            return Sms.Jobs().Lexi().getPtts({
                ptt: outgoing.ptt
            }).$promise.then(function (ptt) {
                outgoing.status = ptt.comment;
                return outgoing;
            });
        });
    };

    self.toggleShowFilter = function () {
        self.outgoing.showFilter = !self.outgoing.showFilter;
        self.outgoing.filterBy = {
            receiver: undefined,
            sender: undefined
        };
        if (self.outgoing.showFilter === false) {
            self.refresh();
        }
    };

    self.toggleOrder = function () {
        self.outgoing.orderDesc = !self.outgoing.orderDesc;
        self.outgoing.raw.reverse();
    };

    self.onTransformItemDone = function () {
        self.outgoing.isLoading = false;
    };

    self.refresh = function () {
        resetAllCache();
        self.outgoing.isLoading = true;
        return fetchOutgoingSms().then(function (outgoing) {
            self.outgoing.raw = angular.copy(outgoing);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.outgoing.isLoading = false;
        });
    };

    self.read = function (outgoingSms) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/outgoing/read/telecom-sms-sms-outgoing-read.html",
            controller: "TelecomSmsSmsOutgoingReadCtrl",
            controllerAs: "OutgoingReadCtrl",
            resolve: {
                outgoingSms: function () { return outgoingSms; },
                outgoingSmsHlr: function () { return fetchOutgoingSmsHlr(outgoingSms); }
            }
        });

        self.outgoing.isReading = true;
        modal.rendered.then(function () {
            self.outgoing.isReading = false;
        });

        return modal;
    };

    self.remove = function (outgoingSms) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/outgoing/remove/telecom-sms-sms-outgoing-remove.html",
            controller: "TelecomSmsSmsOutgoingRemoveCtrl",
            controllerAs: "OutgoingRemoveCtrl",
            resolve: {
                outgoingSms: function () { return outgoingSms; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_outgoing_remove_ko", { error: error.message }));
            }
        });

        return modal;
    };

    self.export = function () {
        self.outgoing.isExporting = true;
        return Sms.Lexi().getDocument({
            serviceName: $stateParams.serviceName,
            "creationDatetime.from": moment(self.serviceInfos.creation).format(),
            "creationDatetime.to": moment().format(),
            wayType: "outgoing"
        }).$promise.then(function (smsDoc) {
            var tryGetDocument = function () {
                User.Document().Lexi().resetCache();
                return User.Document().Lexi().get({
                    id: smsDoc.docId
                }).$promise.then(function (doc) {
                    if (doc.size > 0) {
                        return doc;
                    }
                    self.outgoing.poller = $timeout(tryGetDocument, 1000);
                    return self.outgoing.poller;

                });
            };
            return tryGetDocument().then(function (doc) {
                $window.location.href = doc.getUrl;
            });
        }).catch(function (error) {
            Toast.error($translate.instant("sms_sms_outgoing_download_history_ko"));
            return $q.reject(error);
        }).finally(function () {
            self.outgoing.isExporting = false;
        });
    };

    self.deleteSelectedOutgoing = function () {
        var outgoings = self.getSelection();
        var queries = outgoings.map(function (outgoing) {
            return Sms.Outgoing().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: outgoing.id
            }).$promise;
        });
        self.outgoing.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_sms_outgoing_delete_success"));
        return $q.all(queries).then(function () {
            self.outgoing.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.outgoing.isDeleting = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= ==============================
    =            EVENTS            =
    ===============================*/

    self.getDebouncedOutgoings = debounce(self.refresh, 500, false);

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.outgoing = {
            raw: [],
            paginated: null,
            selected: {},
            orderBy: "creationDatetime",
            orderDesc: true,
            filterBy: {
                receiver: undefined,
                sender: undefined
            },
            showFilter: false,
            isLoading: false,
            isReading: false,
            isExporting: false,
            isDeleting: false,
            poller: null
        };
        self.serviceInfos = null;

        self.outgoing.isLoading = true;
        return $q.all({
            outgoing: fetchOutgoingSms(),
            serviceInfos: fetchServiceInfos()
        }).then(function (results) {
            self.outgoing.raw = angular.copy(results.outgoing);
            self.serviceInfos = results.serviceInfos;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.outgoing.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

    $scope.$on("$destroy", function () {
        $timeout.cancel(self.outgoing.poller);
    });
});
