angular.module("managerApp").controller("TelecomTelephonyServiceConsumptionOutgoingCallsCtrl", function ($stateParams, $q, $translate, $filter, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    function fetchOutgoingConsumption () {
        return OvhApiTelephony.Service().VoiceConsumption().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            // single batch is limited to 50 ids, so we might make multiple batch calls
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.Service().VoiceConsumption().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    consumptionId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.flatten(chunkResult);
            });
        }).then(function (result) {
            return _.chain(result)
                .pluck("value")
                .filter(function (conso) {
                    return conso.wayType !== "incoming" && conso.duration > 0;
                })
                .map(function (conso) {
                    conso.durationAsDate = new Date(conso.duration * 1000);
                    return conso;
                })
                .value();
        });
    }

    function init () {

        self.consumption = {
            raw: null,
            sorted: null,
            paginated: null,
            selected: null,
            orderBy: "creationDatetime",
            orderDesc: true,
            filterBy: {
                dialed: undefined
            },
            showFilter: false,
            sum: {
                pricePlan: {
                    calls: null,
                    durationAsDate: null
                },
                outPlan: {
                    calls: null,
                    durationAsDate: null,
                    price: null
                }
            }
        };

        self.period = {
            start: moment().startOf("month"),
            end: moment().endOf("month")
        };

        fetchOutgoingConsumption().then(function (result) {
            self.consumption.raw = angular.copy(result);
            self.consumption.sorted = angular.copy(result);
            self.applySorting();
            self.consumption.sum.pricePlan.calls = _.sum(self.consumption.raw, function (conso) {
                return conso.planType === "priceplan" ? 1 : 0;
            });
            self.consumption.sum.pricePlan.durationAsDate = new Date(_.sum(self.consumption.raw, function (conso) {
                return conso.planType === "priceplan" ? conso.duration : 0;
            }) * 1000);
            self.consumption.sum.outPlan.calls = _.sum(self.consumption.raw, function (conso) {
                return conso.planType === "outplan" ? 1 : 0;
            });
            self.consumption.sum.outPlan.durationAsDate = new Date(_.sum(self.consumption.raw, function (conso) {
                return conso.planType === "outplan" ? conso.duration : 0;
            }) * 1000);
            var priceSuffix = "";
            self.consumption.sum.outPlan.price = _.sum(self.consumption.raw, function (conso) {
                if (conso.planType === "outplan" && conso.priceWithoutTax) {
                    // since we compute the sum manually we must guess and add the currency symbol
                    // @TODO fetch sum from api when available
                    priceSuffix = priceSuffix || conso.priceWithoutTax.text.replace(/[0-9\.\,\s]/g, "");
                    return conso.priceWithoutTax.value;
                }
                return null;
            });
            self.consumption.sum.outPlan.price = (Math.floor(self.consumption.sum.outPlan.price * 100.0, 2) / 100.0) + " " + priceSuffix;
        }, function (err) {
            return new ToastError(err);
        });
    }

    self.refresh = function () {
        OvhApiTelephony.Service().VoiceConsumption().v6().resetCache();
        OvhApiTelephony.Service().VoiceConsumption().v6().resetQueryCache();
        init();
    };

    self.applySorting = function () {
        var data = angular.copy(self.consumption.raw);
        data = $filter("filter")(data, self.consumption.filterBy);
        data = $filter("orderBy")(
            data,
            self.consumption.orderBy,
            self.consumption.orderDesc
        );
        self.consumption.sorted = data;
    };

    self.toggleShowFilter = function () {
        self.consumption.showFilter = !self.consumption.showFilter;
        self.consumption.filterBy = {
            dialed: undefined
        };
        self.applySorting();
    };

    self.orderBy = function (by) {
        if (self.consumption.orderBy === by) {
            self.consumption.orderDesc = !self.consumption.orderDesc;
        } else {
            self.consumption.orderBy = by;
        }
        self.applySorting();
    };

    init();
});
