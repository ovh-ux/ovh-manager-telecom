angular.module("managerApp").controller("TelecomSmsSmsIncomingCtrl", function ($scope, $stateParams, $q, $filter, $window, $uibModal, $translate, $timeout, Sms, User, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchIncomingSms () {
        return Sms.Incoming().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (incomingIds) {
            return $q.all(_.map(_.chunk(incomingIds, 50), function (chunkIds) {
                return Sms.Incoming().Lexi().getBatch({
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.pluck(_.flatten(chunkResult), "value");
            });
        });
    }

    function fetchServiceInfos () {
        return Sms.Lexi().getServiceInfos({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    self.getSelection = function () {
        return _.filter(self.incoming.raw, function (incoming) {
            return incoming && self.incoming.selected && self.incoming.selected[incoming.id];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        Sms.Incoming().Lexi().resetAllCache();
        self.incoming.isLoading = true;
        return $q.all({
            incoming: fetchIncomingSms(),
            serviceInfos: fetchServiceInfos()
        }).then(function (results) {
            self.incoming.raw = angular.copy(results.incoming);
            self.serviceInfos = results.serviceInfos;
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.incoming.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.incoming.raw);
        data = $filter("filter")(data, self.incoming.filterBy);
        data = $filter("orderBy")(
            data,
            self.incoming.orderBy,
            self.incoming.orderDesc
        );
        self.incoming.sorted = data;
    };

    self.toggleShowFilter = function () {
        self.incoming.showFilter = !self.incoming.showFilter;
        self.incoming.filterBy = {
            sender: undefined
        };
        self.applySorting();
    };

    self.orderBy = function (by) {
        if (self.incoming.orderBy === by) {
            self.incoming.orderDesc = !self.incoming.orderDesc;
        } else {
            self.incoming.orderBy = by;
        }
        self.applySorting();
    };

    self.deleteSelectedIncoming = function () {
        var incomings = self.getSelection();
        var queries = incomings.map(function (incoming) {
            return Sms.Incoming().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: incoming.id
            }).$promise;
        });
        self.incoming.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_sms_incoming_remove_success"));
        return $q.all(queries).then(function () {
            self.incoming.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.incoming.isDeleting = false;
        });
    };

    self.read = function (incomingSms) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/incoming/read/telecom-sms-sms-incoming-read.html",
            controller: "TelecomSmsSmsIncomingReadCtrl",
            controllerAs: "IncomingReadCtrl",
            resolve: {
                incomingSms: function () { return incomingSms; }
            }
        });

        self.incoming.isReading = true;
        modal.rendered.then(function () {
            self.incoming.isReading = false;
        });

        return modal;
    };

    self.remove = function (incomingSms) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/sms/incoming/remove/telecom-sms-sms-incoming-remove.html",
            controller: "TelecomSmsSmsIncomingRemoveCtrl",
            controllerAs: "IncomingRemoveCtrl",
            resolve: {
                incomingSms: function () { return incomingSms; }
            }
        });

        modal.result.then(function () {
            self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_sms_incoming_remove_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.export = function () {
        self.incoming.isExporting = true;
        return Sms.Lexi().getDocument({
            serviceName: $stateParams.serviceName,
            "creationDatetime.from": moment(self.serviceInfos.creation).format(),
            "creationDatetime.to": moment().format(),
            wayType: "incoming"
        }).$promise.then(function (smsDoc) {
            var tryGetDocument = function () {
                User.Document().Lexi().resetCache();
                return User.Document().Lexi().get({
                    id: smsDoc.docId
                }).$promise.then(function (doc) {
                    if (doc.size > 0) {
                        return doc;
                    }
                    self.incoming.poller = $timeout(tryGetDocument, 1000);
                    return self.incoming.poller;

                });
            };
            return tryGetDocument().then(function (doc) {
                $window.location.href = doc.getUrl;
                $timeout(function () {
                    return User.Document().Lexi().delete({
                        id: doc.id
                    }).$promise;
                }, 3000);
            });
        }).catch(function (error) {
            Toast.error($translate.instant("sms_sms_incoming_download_history_ko"));
            return $q.reject(error);
        }).finally(function () {
            self.incoming.isExporting = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.incoming = {
            raw: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "creationDatetime",
            orderDesc: false,
            filterBy: {
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

        self.refresh();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

    $scope.$on("$destroy", function () {
        $timeout.cancel(self.incoming.poller);
    });
});
