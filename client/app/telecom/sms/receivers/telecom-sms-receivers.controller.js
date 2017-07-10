angular.module("managerApp").controller("TelecomSmsReceiversCtrl", function ($scope, $stateParams, $q, $filter, $uibModal, $translate, $timeout, Sms, CSVParser, Toast, ToastError, URLS) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchReceivers () {
        return Sms.Receivers().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (receiversIds) {
            self.slot.raw = receiversIds;

            // slotId isn't auto generated :( and must be in the range 1…9.
            for (var i = 1; i <= self.slot.threshold; i++) {
                if (_.indexOf(self.slot.raw, i) === -1) {
                    self.slot.available.push(i);
                }
            }
            self.slot.count = receiversIds.length;
            self.slot.isFull = self.slot.count >= self.slot.threshold;
            return $q.all(_.map(receiversIds, function (id) {
                return Sms.Receivers().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    slotId: id
                }).$promise;
            }));
        });
    }

    self.getSelection = function () {
        return _.filter(self.receivers.raw, function (receiver) {
            return receiver && self.receivers.selected && self.receivers.selected[receiver.slotId];
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refresh = function () {
        Sms.Receivers().Lexi().resetAllCache();
        self.slot.available = [];
        self.receivers.isLoading = true;
        return fetchReceivers().then(function (receivers) {
            self.receivers.raw = angular.copy(receivers);
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.receivers.isLoading = false;
        });
    };

    self.applySorting = function () {
        var data = angular.copy(self.receivers.raw);
        data = $filter("orderBy")(
            data,
            self.receivers.orderBy,
            self.receivers.orderDesc
        );
        self.receivers.sorted = data;
    };

    self.orderBy = function (by) {
        if (self.receivers.orderBy === by) {
            self.receivers.orderDesc = !self.receivers.orderDesc;
        } else {
            self.receivers.orderBy = by;
        }
        self.applySorting();
    };

    self.add = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/receivers/add/telecom-sms-receivers-add.html",
            controller: "TelecomSmsReceiversAddCtrl",
            controllerAs: "ReceiversAddCtrl",
            resolve: {
                slot: function () { return self.slot; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_receivers_add_receiver_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.edit = function (receiver) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/receivers/edit/telecom-sms-receivers-edit.html",
            controller: "TelecomSmsReceiversEditCtrl",
            controllerAs: "ReceiversEditCtrl",
            resolve: {
                receiver: function () { return receiver; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_receivers_edit_receiver_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.read = function (receiver) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/receivers/read/telecom-sms-receivers-read.html",
            controller: "TelecomSmsReceiversReadCtrl",
            controllerAs: "ReceiversReadCtrl",
            resolve: {
                receiver: function () { return receiver; },
                csv: function () { return self.getCsvData(receiver); }
            }
        });

        self.receivers.isReading = true;
        modal.rendered.then(function () {
            self.receivers.isReading = false;
        });

        return modal;
    };

    self.clean = function (receiver) {
        if (self.receivers.isCleaning) {
            return $q.when(null);
        }

        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/receivers/clean/telecom-sms-receivers-clean.html",
            controller: "TelecomSmsReceiversCleanCtrl",
            controllerAs: "ReceiversCleanCtrl",
            resolve: {
                receiver: function () { return receiver; }
            }
        });

        modal.result.then(function (response) {
            if (_.has(response, "taskId")) {
                self.receivers.isCleaning = true;
                return Sms.Task().Lexi().poll($scope, {
                    serviceName: $stateParams.serviceName,
                    taskId: response.taskId
                })
                    .then(function (voidResponse) {
                        return voidResponse;
                    })
                    .finally(function () {
                        self.receivers.isCleaning = false;
                        self.refresh();
                    });
            }
            return response;

        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_receivers_clean_receiver_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.getCsvData = function (receiver) {
        return Sms.Receivers().Lexi().getCsv({
            serviceName: $stateParams.serviceName,
            slotId: receiver.slotId
        }).$promise.then(function (csv) {
            CSVParser.setColumnSeparator(";");
            CSVParser.setDetectTypes(false);

            try {
                self.csv.data = CSVParser.parse(csv.data);
            } catch (err) {
                self.csv.data = null;
                Toast.error($translate.instant("sms_receivers_read_receiver_parse_ko", { error: _.get(err, "msg.data.message") }));
            }

            return self.csv.data;
        }).catch(function (err) {
            self.receivers.isReading = false;
            return new ToastError(err);
        });
    };

    self.setFilename = function (receiver) {
        return _.kebabCase([
            $stateParams.serviceName,
            $translate.instant("sms_tabs_contacts"),
            receiver.description
        ].join()) + ".csv";
    };

    self.remove = function (receiver) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/receivers/remove/telecom-sms-receivers-remove.html",
            controller: "TelecomSmsReceiversRemoveCtrl",
            controllerAs: "ReceiversRemoveCtrl",
            resolve: {
                receiver: function () { return receiver; }
            }
        });

        modal.result.then(function () {
            return self.refresh();
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_receivers_remove_receiver_ko", { error: _.get(error, "msg.data.message") }));
            }
        });

        return modal;
    };

    self.deleteSelectedReceivers = function () {
        var receivers = self.getSelection();
        var queries = receivers.map(function (receiver) {
            return Sms.Receivers().Lexi().delete({
                serviceName: $stateParams.serviceName,
                slotId: receiver.slotId
            }).$promise;
        });
        self.receivers.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_receivers_delete_receivers_success"));
        return $q.all(queries).then(function () {
            self.receivers.selected = {};
            return self.refresh();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.receivers.isDeleting = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.receivers = {
            raw: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "description",
            orderDesc: false,
            isLoading: false,
            isReading: false,
            isCleaning: false,
            isDeleting: false
        };

        self.slot = {
            raw: [],
            available: [],
            count: null,
            isFull: false,
            threshold: 9
        };

        self.csv = {
            raw: null,
            data: null
        };

        self.urls = {
            receivers: _.get(URLS, "guides.sms.receivers")
        };

        self.receivers.isLoading = true;
        return fetchReceivers().then(function (receivers) {
            self.receivers.raw = angular.copy(receivers);
            self.applySorting();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.receivers.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
