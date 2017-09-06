angular.module("managerApp").controller("TelecomTelephonyAliasAdministrationConvertToLineCtrl", function ($stateParams, $q, $translate, OvhApiTelephony, ToastError, Toast) {
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
                return self.getAvailableOffers().then(function (availableOffers) {
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

    self.getAvailableOffers = function () {
        return OvhApiTelephony.Number().Lexi().convertToLineAvailableOffers({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    };

    self.fetchConvertToLineTask = function () {
        return OvhApiTelephony.Service().OfferTask().Lexi().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            action: "convertToSip",
            type: "offer"
        }).$promise.then(function (taskIds) {
            return $q.all(_.map(taskIds, function (id) {
                return OvhApiTelephony.Service().OfferTask().Lexi().get({
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
        return OvhApiTelephony.Number().Lexi().convertToLine({
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
        return OvhApiTelephony.Number().Lexi().cancelConvertToLine({
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

    init();
});
