angular.module("managerApp").controller("TelecomTelephonyServiceConsumptionIncomingCallsCtrl", function ($stateParams, $q, $translate, $filter, $timeout, Telephony, ToastError) {
    "use strict";

    var self = this;

    function fetchIncomingConsumption () {
        return Telephony.Service().VoiceConsumption().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            // single batch is limited to 50 ids, so we might make multiple batch calls
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return Telephony.Service().VoiceConsumption().Lexi().getBatch({
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
                    return conso.wayType !== "outgoing";
                })
                .map(function (conso) {
                    conso.durationAsDate = new Date(conso.duration * 1000);
                    if (conso.wayType === "incoming" && conso.duration === 0) {
                        conso.wayType = "missing";
                    }
                    if (/anonymous/.test(conso.calling)) {
                        conso.calling = $translate.instant("telephony_service_consumption_anonymous");
                    }
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
            durationSum: 0,
            isLoading: false,
            orderBy: "creationDatetime",
            orderDesc: true,
            filterBy: {
                calling: undefined,
                dialed: undefined
            },
            showFilter: false
        };

        self.period = {
            start: moment().startOf("month"),
            end: moment().endOf("month")
        };

        self.serviceName = $stateParams.serviceName;

        self.consumption.isLoading = true;
        fetchIncomingConsumption().then(function (result) {
            self.consumption.raw = angular.copy(result);
            self.applySorting();
            self.consumption.durationSum = new Date(_.sum(self.consumption.raw, function (conso) {
                return conso.duration;
            }) * 1000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.consumption.isLoading = false;
        });
    }

    self.refresh = function () {
        Telephony.Service().VoiceConsumption().Lexi().resetCache();
        Telephony.Service().VoiceConsumption().Lexi().resetQueryCache();
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
            calling: undefined,
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
