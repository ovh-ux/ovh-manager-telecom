angular.module("managerApp").controller("TelecomSmsOptionsRecreditUpdateCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, OrderSms, service, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        updateOptions: false,
        price: false
    };

    self.updated = false;

    self.service = angular.copy(service);
    self.availablePackQuantity = [];
    self.price = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.hasChanged = function () {
        return !(
            self.service.creditThresholdForAutomaticRecredit === service.creditThresholdForAutomaticRecredit &&
            self.service.automaticRecreditAmount === service.automaticRecreditAmount
        );
    };

    self.getAmount = function () {
        if (self.service.automaticRecreditAmount) {
            self.loading.price = true;

            return OrderSms.Lexi().getCredits({
                serviceName: $stateParams.serviceName,
                quantity: self.service.automaticRecreditAmount
            }).$promise.then(function (credits) {
                self.price = _.result(credits, "prices.withoutTax");
                return self.price;
            }).finally(function () {
                self.loading.price = false;
            });
        }
        self.price = null;
        return $q.when(null);
    };

    self.setAutomaticRecredit = function () {
        self.loading.updateOptions = true;

        return $q.all([
            Sms.Lexi().put({
                serviceName: $stateParams.serviceName
            }, {
                creditThresholdForAutomaticRecredit: self.service.creditThresholdForAutomaticRecredit,
                automaticRecreditAmount: self.service.automaticRecreditAmount
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.updateOptions = false;
            self.updated = true;

            service.creditThresholdForAutomaticRecredit = self.service.creditThresholdForAutomaticRecredit;
            service.automaticRecreditAmount = self.service.automaticRecreditAmount;
            service.price = null;

            return $timeout(self.close, 1500);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return SmsMediator.initDeferred.promise.then(function () {
            return SmsMediator.getApiScheme().then(function (schema) {
                self.availablePackQuantity = _.sortBy(
                    _.map(schema.models["sms.PackQuantityAutomaticRecreditEnum"].enum, Number)
                );
            });
        }).then(function () {
            return self.getAmount();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
