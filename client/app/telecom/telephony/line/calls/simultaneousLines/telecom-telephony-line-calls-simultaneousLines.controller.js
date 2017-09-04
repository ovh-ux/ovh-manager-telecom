angular.module("managerApp").controller("TelecomTelephonyLineCallsSimultaneousLinesCtrl", function ($q, $stateParams, $state, $translate, Toast, Telephony, OrderTelephony, debounce, TelephonyService, $filter, TelephonyMediator) {
    "use strict";

    var self = this;
    var apiResources = {
        getSimultaneousLines: OrderTelephony.Lexi().getSimultaneousLines,
        orderSimultaneousLines: OrderTelephony.Lexi().orderSimultaneousLines
    };

    self.v4redirect = {
        name: "line_simultaneouslines",
        url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_simultaneouslines"),
        text: $translate.instant("modify")
    };

    self.needSave = function () {
        return self.options.simultaneousLines !== self.saved.simultaneousLines;
    };

    self.showOrder = function () {

        self.loading.order = true;

        return apiResources.getSimultaneousLines({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            quantity: self.options.simultaneousLines - self.saved.simultaneousLines
        }).$promise.then(function (order) {
            self.contracts = order.contracts;
            self.prices = order;
            return order;
        }).catch(function (err) {
            return $translate("telephony_line_actions_line_calls_simultaneous_line_write_error").then(function (message) {
                Toast.error([message, _.get(err, "data.message")].join(" "));
                return $q.reject(err);
            });
        }).finally(function () {
            self.loading.order = false;
        });
    };

    self.doOrder = function () {
        self.loading.doOrder = true;

        return apiResources.orderSimultaneousLines({
            serviceName: $stateParams.serviceName
        }, {
            billingAccount: $stateParams.billingAccount,
            quantity: self.options.simultaneousLines - self.saved.simultaneousLines
        }).$promise.then(function (order) {
            self.contracts = order.contracts;
            self.prices = order;
            return order;
        }).catch(function (err) {
            return $translate("telephony_line_actions_line_calls_simultaneous_line_order_error").then(function (message) {
                Toast.error(message);
                return $q.reject(err);
            });
        }).finally(function () {
            self.loading.order = false;
            self.loading.doOrder = false;
        });
    };

    function getOfferTasks () {
        return TelephonyService.OfferTask().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            action: "removeSimltaneousLines"
        }).$promise.then(function (offerTasks) {
            return $q.all(_.map(offerTasks, function (taskId) {
                return TelephonyService.OfferTask().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    taskId: taskId
                }).$promise.then(function (taskDetail) {
                    taskDetail.formatedDate = $filter("date")(taskDetail.executionDate, "fullDate");
                    return taskDetail;
                }).catch(function (err) {
                    return $translate("telephony_line_actions_line_calls_simultaneous_line_offer_task_error").then(function (message) {
                        Toast.error(message);
                        return $q.reject(err);
                    });
                });
            }));
        }).then(function (offerTasksDetails) {
            self.offerTasks = offerTasksDetails;
            return self.offerTasks;
        });
    }

    self.doRemoveSimultaneousLines = function () {
        self.loading.save = true;

        return Telephony.Line().Lexi().removeSimultaneousLine({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            quantityRemove: self.saved.simultaneousLines - self.options.simultaneousLines
        }).$promise.then(function () {
            self.loading.save = false;
            self.showDoRemoveButtons = false;
            self.saved.simultaneousLines = self.options.simultaneousLines;
            return getOfferTasks();
        }).catch(function (err) {
            return $translate("telephony_line_actions_line_calls_simultaneous_line_write_error").then(function (message) {
                Toast.error([message, _.get(err, "data.message")].join(" "));
                self.cancelRemove();
                self.options.minimumAvailableSimultaneousLines = self.saved.simultaneousLines;
                return $q.reject(err);
            });
        }).finally(function () {
            self.loading.save = false;
        });
    };

    self.cancelRemove = function () {
        self.showDoRemoveButtons = false;
        self.options.simultaneousLines = self.saved.simultaneousLines;
    };

    self.save = debounce(function () {

        self.contracts = null;
        self.prices = null;
        self.contractsAccepted = false;

        if (self.needSave) {

            if (self.saved.simultaneousLines < self.options.simultaneousLines) {
                self.loading.save = true;
                self.showDoRemoveButtons = false;
                return self.showOrder().finally(function () {
                    self.loading.save = false;
                });
            }
            if (self.saved.simultaneousLines > self.options.simultaneousLines) {
                self.showDoRemoveButtons = true;
            }


        } else {
            self.showDoRemoveButtons = false;
        }

        return $q.when(null);
    }, 200, false);

    function init () {

        self.loading = {
            init: true,
            order: false,
            doOrder: false,
            save: false
        };
        self.contractsAccepted = false;
        self.contracts = null;
        self.prices = null;
        self.saved = { };
        self.offerTasks = [];
        self.options = {
            simultaneousLines: null,
            maximumAvailableSimultaneousLines: 0,
            minimumAvailableSimultaneousLines: 1
        };

        return $q.all([

            getOfferTasks(),

            Telephony.Line().Lexi().get({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(function (options) {
                self.options.simultaneousLines = options.simultaneousLines;
                var isTrunk = _.some(options.offers, function (offer) {
                    return _.startsWith(offer, "voip.main.offer.trunk");
                });

                if (isTrunk) {
                    apiResources.getSimultaneousLines = OrderTelephony.Lexi().getSimultaneousTrunkLines;
                    apiResources.orderSimultaneousLines = OrderTelephony.Lexi().orderSimultaneousTrunkLines;
                }

                self.saved = angular.copy(self.options);
                return self.options;
            }),

            Telephony.Line().Lexi().maximumAvailableSimultaneousLines({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(function (maximumAvailableSimultaneousLines) {
                self.options.maximumAvailableSimultaneousLines = maximumAvailableSimultaneousLines.maximum;
                return self.options;
            })

        ]).finally(function () {
            self.loading.init = false;
        }).catch(function () {
            return $translate("telephony_line_actions_line_calls_simultaneous_line_load_error").then(function (message) {
                return Toast.error(message);
            });
        });
    }

    init();
}
);
