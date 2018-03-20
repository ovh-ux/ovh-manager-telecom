angular.module("managerApp")
    .controller("TelecomTelephonyLineCallsSimultaneousLinesCtrl", function ($filter, $q, $stateParams, $translate,
                                                                            currentLine, OvhApiOrderTelephony, OvhApiTelephony, OvhApiTelephonyService, telephonyBulk, Toast) {
        "use strict";

        var self = this;
        var apiResources = {
            getSimultaneousLines: OvhApiOrderTelephony.v6().getSimultaneousLines,
            orderSimultaneousLines: OvhApiOrderTelephony.v6().orderSimultaneousLines
        };

        var unitPrices = null;

        self.bulkOrders = [];
        self.isTrunk = false;

        self.orderUrl = null;
        self.showBulkOrderSummary = false;

        self.needSave = function () {
            return self.options.simultaneousLines !== self.saved.simultaneousLines;
        };

        self.doOrder = function () {
            self.loading.doOrder = true;

            return apiResources.orderSimultaneousLines({
                serviceName: $stateParams.serviceName
            }, {
                quantity: self.options.simultaneousLines
            }).$promise.then(function (order) {
                self.orderUrl = order.url;
                self.prices = order.prices;
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

        self.doRemoveSimultaneousLines = function () {
            self.loading.save = true;

            return OvhApiTelephony.Line().v6().removeSimultaneousLine({
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

        self.save = function () {
            self.prices = null;
            self.contractsAccepted = false;
            self.showDoRemoveButtons = false;

            if (self.needSave()) {
                if (self.saved.simultaneousLines < self.options.simultaneousLines) {
                    self.showDoRemoveButtons = false;
                    self.recalculatePrices();
                }
                if (self.saved.simultaneousLines > self.options.simultaneousLines && self.options.simultaneousLines) {
                    self.showDoRemoveButtons = true;
                }
            } else {
                self.showDoRemoveButtons = false;
            }
        };

        self.recalculatePrices = function () {
            var quantity = self.options.simultaneousLines - self.saved.simultaneousLines;

            self.prices = {
                tax: { text: $filter("currency")(unitPrices.tax.value * quantity) },
                withTax: { text: $filter("currency")(unitPrices.withTax.value * quantity) },
                withoutTax: { text: $filter("currency")(unitPrices.withoutTax.value * quantity) }
            };
        };

        function getUnitPrices () {
            return apiResources.getSimultaneousLines({
                serviceName: $stateParams.serviceName,
                quantity: currentLine.simultaneousLinesDetails.current + 1
            }).$promise.then(function (order) {
                self.contracts = order.contracts;
                unitPrices = order.prices;
                return order;
            }).catch(function (err) {
                return $translate("telephony_line_actions_line_calls_simultaneous_line_write_error").then(function (message) {
                    Toast.error([message, _.get(err, "data.message")].join(" "));
                    return $q.reject(err);
                });
            });
        }

        function getOfferTasks () {
            return OvhApiTelephonyService.OfferTask().v6().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                action: "removeSimltaneousLines"
            }).$promise.then(function (offerTasks) {
                return $q.all(_.map(offerTasks, function (taskId) {
                    return OvhApiTelephonyService.OfferTask().v6().get({
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

        function init () {

            if (!currentLine) {
                Toast.error($translate.instant("telephony_line_actions_line_calls_simultaneous_line_load_error"));
                return $q.when(null);
            }

            self.loading = {
                init: true,
                order: false,
                orderUrl: null,
                doOrder: false,
                save: false
            };
            self.contractsAccepted = false;
            self.contracts = null;
            self.hundredLines = false;
            self.prices = null;
            self.saved = { };
            self.offerTasks = [];
            self.options = {
                simultaneousLines: null,
                maximumAvailableSimultaneousLines: currentLine.simultaneousLinesDetails.maximum,
                minimumAvailableSimultaneousLines: 1
            };

            self.showBulkOrderSummary = false;

            self.options.simultaneousLines = currentLine.simultaneousLines;
            self.hundredLines = currentLine.simultaneousLines >= 100;

            self.isTrunk = _.some(currentLine.offers, function (offer) {
                return _.startsWith(offer, "voip.main.offer.trunk");
            });

            if (self.isTrunk) {
                apiResources.getSimultaneousLines = OvhApiOrderTelephony.v6().getSimultaneousTrunkLines;
                apiResources.orderSimultaneousLines = OvhApiOrderTelephony.v6().orderSimultaneousTrunkLines;
            }

            self.options.details = currentLine.simultaneousLinesDetails;
            self.saved = angular.copy(self.options);

            return $q.all([

                getOfferTasks(),
                getUnitPrices()

            ]).finally(function () {
                self.loading.init = false;
            }).catch(function () {
                return $translate("telephony_line_actions_line_calls_simultaneous_line_load_error").then(function (message) {
                    return Toast.error(message);
                });
            });
        }

        init();

        /* ===========================
        =            BULK            =
        ============================ */

        self.bulkDatas = {
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            infos: {
                name: "simultaneousCalls",
                actions: [{
                    name: "removeSimultaneousLines",
                    route: "/telephony/{billingAccount}/line/{serviceName}/removeSimultaneousLines",
                    method: "POST",
                    params: null
                }, {
                    name: "updateSimultaneousChannels",
                    route: "/order/telephony/lines/{serviceName}/updateSimultaneousChannels",
                    method: "POST",
                    params: null
                }]
            }
        };

        self.filterServices = function (services) {
            return _.filter(services, function (service) {
                return ["sip", "mgcp"].indexOf(service.featureType) > -1 && service.hasValidPublicOffer() && !service.isSipTrunk();
            });
        };

        self.getBulkParams = function () {
            return self.options.simultaneousLines;
        };

        self.onBulkSuccess = function (bulkResult) {
            // display message of success or error
            telephonyBulk.getToastInfos(bulkResult, {
                fullSuccess: $translate.instant("telephony_line_actions_line_calls_simultaneous_bulk_all_success"),
                partialSuccess: $translate.instant("telephony_line_actions_line_calls_simultaneous_bulk_some_success", {
                    count: bulkResult.success.length
                }),
                error: $translate.instant("telephony_line_actions_line_calls_simultaneous_bulk_error")
            }).forEach(function (toastInfo) {
                Toast[toastInfo.type](toastInfo.message, {
                    hideAfter: null
                });
            });

            if (bulkResult.success.length > 0) {
                self.buildOrderSummary(bulkResult.success);
            }
        };

        self.onBulkError = function (error) {
            Toast.error([$translate.instant("telephony_line_actions_line_calls_simultaneous_bulk_on_error"), _.get(error, "msg.data")].join(" "));
        };

        self.buildOrderSummary = function (orders) {
            self.bulkOrders = _.chain(orders).map("values").flatten().filter({ action: "updateSimultaneousChannels" }).map("value").value();

            self.showBulkOrderSummary = self.bulkOrders.length > 0;
        };

        /* -----  End of BULK  ------ */
    });
