angular.module("managerApp").controller("TelecomTelephonyAliasAdministrationConvertToLineCtrl", function ($stateParams, $q, $translate, OvhApiTelephony, ToastError, Toast, telephonyBulk) {
    "use strict";

    var self = this;

    function init () {

        self.serviceName = $stateParams.serviceName;
        self.contractsAccepted = false;
        self.isConverting = false;
        self.isLoading = false;
        self.offerError = null;

        return self.refresh().catch(function (err) {
            if (err.status === 400 && /number range.*forbidden change/.test(_.get(err, "data.message"))) {
                self.offerError = $translate.instant("telephony_alias_administration_convert_range_error");
                return $q.reject(err);
            }
            return new ToastError(err);

        });
    }

    self.refresh = function () {
        self.isLoading = true;
        self.contractsAccepted = false;
        return self.fetchConvertToLineTask().then(function (task) {
            self.convertTask = task;
            if (!task) {
                return self.getAvailableOffers($stateParams).then(function (availableOffers) {
                    self.offers = availableOffers.offers;
                    self.offer = _.first(self.offers);
                    self.contracts = availableOffers.contracts;
                });
            }
            return null;
        }).finally(function () {
            self.isLoading = false;
        });
    };

    self.getAvailableOffers = function (service) {
        return OvhApiTelephony.Number().v6().convertToLineAvailableOffers({
            billingAccount: service.billingAccount,
            serviceName: service.serviceName
        }).$promise;
    };

    self.fetchConvertToLineTask = function () {
        return OvhApiTelephony.Service().OfferTask().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            action: "convertToSip",
            type: "offer"
        }).$promise.then(function (taskIds) {
            return $q.all(_.map(taskIds, function (id) {
                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    taskId: id
                }).$promise;
            })).then(function (tasks) {
                return _.first(_.filter(tasks, { status: "todo" }));
            });
        });
    };

    self.convertToLine = function () {
        self.isConverting = true;
        return OvhApiTelephony.Number().v6().convertToLine({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            offer: self.offer.name
        }).$promise.then(function () {
            return self.refresh();
        }).then(function () {
            Toast.success($translate.instant("telephony_alias_administration_convert_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isConverting = false;
        });
    };

    self.cancelConvertion = function () {
        self.isCancelling = true;
        return OvhApiTelephony.Number().v6().cancelConvertToLine({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {}).$promise.then(function () {
            return self.refresh();
        }).then(function () {
            Toast.success($translate.instant("telephony_alias_administration_convert_cancel_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isCancelling = false;
        });
    };

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "terminate",
            actions: [{
                name: "service",
                route: "/telephony/{billingAccount}/number/{serviceName}/convertToLine",
                method: "POST",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {

        function setServicesWithOffer (paramServices, listOffers) {
            var servicesFiltered = [];

            _.times(listOffers.length, function (index) {
                if (listOffers[index].status !== 404 || listOffers[index].status !== 400) {
                    if (_.some(listOffers[index].offers, "name", self.offer.name)) {
                        servicesFiltered.push(paramServices[index]);
                    }
                }
            });

            return $q.when(servicesFiltered);
        }

        var promises = [];

        _.forEach(services, function (service) {
            promises.push(self.getAvailableOffers(service));
        });

        return $q.allSettled(promises).then(function (listOffers) {
            return setServicesWithOffer(services, listOffers);
        }).catch(function (listOffers) {
            return setServicesWithOffer(services, listOffers);
        });
    };

    self.getBulkParams = function () {
        return {
            offer: self.offer.name
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_alias_administration_convert_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_alias_administration_convert_bulk_some_success", {
                count: bulkResult.success.length

            }),
            error: $translate.instant("telephony_alias_administration_convert_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_alias_administration_convert_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    init();
});
