angular.module("managerApp").controller("TelecomTelephonyServiceConsumptionOutgoingFaxCtrl", function ($stateParams, $q, $translate, $filter, $timeout, OvhApiTelephony, ToastError) {
    "use strict";

    var self = this;

    function fetchOutgoingConsumption () {
        return OvhApiTelephony.Service().FaxConsumption().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.Service().FaxConsumption().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    consumptionId: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                return _.flatten(chunkResult);
            });
        }).then(function (resultParam) {
            var result = _.pluck(resultParam, "value");
            result = _.filter(result, function (conso) {
                return conso.wayType === "sent";
            });
            return result;
        });
    }

    self.$onInit = function () {

        self.consumption = {
            raw: null,
            sorted: null,
            paginated: null,
            selected: null,
            pagesSum: 0,
            orderBy: "creationDatetime",
            orderDesc: true,
            filterBy: {
                called: undefined
            },
            showFilter: false
        };

        self.period = {
            start: moment().startOf("month"),
            end: moment().endOf("month")
        };

        fetchOutgoingConsumption().then(function (result) {
            self.consumption.raw = angular.copy(result);
            self.applySorting();
            self.consumption.pagesSum = _.sum(self.consumption.raw, function (conso) {
                return conso.pages;
            });
            var priceSuffix = "";
            self.consumption.priceSum = _.sum(self.consumption.raw, function (conso) {
                if (conso.priceWithoutTax) {
                    priceSuffix = priceSuffix || conso.priceWithoutTax.text.replace(/[0-9\.\,\s]/g, "");
                    return conso.priceWithoutTax.value;
                }
                return 0.0;

            });
            self.consumption.priceSum = (Math.floor(self.consumption.priceSum * 100.0, 2) / 100.0) + " " + priceSuffix;
        }, function (err) {
            return new ToastError(err);
        });
    };

    self.refresh = function () {
        OvhApiTelephony.Service().FaxConsumption().v6().resetCache();
        OvhApiTelephony.Service().FaxConsumption().v6().resetQueryCache();
        self.$onInit();
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
            called: undefined
        };
        self.applySorting();
    };

});
