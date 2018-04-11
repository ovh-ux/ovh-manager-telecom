angular.module("managerApp").controller("TelecomTelephonyLineCallsExternalNumberCtrl", function ($scope, $q, $stateParams, $translate, $timeout, TelecomMediator, TelephonyMediator, OvhApiTelephony, Toast, NumberPlans) {
    "use strict";

    var self = this;
    var pollTimeout = null;

    self.loading = {
        init: false,
        add: false,
        remove: false
    };

    self.model = {
        number: null,
        autoValidation: false
    };

    self.line = null;
    self.isVip = false;
    self.toDelete = null;

    /* =============================
    =            HELPES            =
    ============================== */

    function fetchExternalDisplayedNumber () {
        return OvhApiTelephony.Trunk().ExternalDisplayedNumber().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (numbers) {
            return $q.all(_.map(_.chunk(numbers, 50), function (chunkNumbers) {
                return OvhApiTelephony.Trunk().ExternalDisplayedNumber().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    number: chunkNumbers
                }).$promise;
            })).then(function (chunkResult) {
                return _.flatten(chunkResult);
            });
        }).then(function (resultParam) {
            return _.chain(resultParam).filter(function (number) {
                return number.value !== null;
            }).pluck("value").value();
        });
    }

    function resetModel () {
        self.model.number = null;
    }

    function startPolling () {
        pollTimeout = $timeout(function () {
            return fetchExternalDisplayedNumber().then(function (numbers) {
                self.list = numbers;
                startPolling();
            });
        }, 10000);
    }

    function stopPolling () {
        if (pollTimeout) {
            $timeout.cancel(pollTimeout);
        }
    }

    self.checkSamePrefix = function (value) {
        if (!value) {
            return true;
        }
        return _.startsWith(value.replace("+", "00"), self.plan.prefix.replace("+", "00"));
    };

    /* -----  End of HELPES  ------ */

    /* =============================
    =            EVENTS            =
    ============================== */

    self.onExternalNumberAddFormSubmit = function () {
        var validationPromise = $q.when(true);
        self.validationCode = null;

        self.loading.add = true;

        return OvhApiTelephony.Trunk().ExternalDisplayedNumber().v6().save({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, self.model).$promise.then(function (externalNumber) {
            self.list.push(externalNumber);
            if (!self.model.autoValidation) {
                validationPromise = OvhApiTelephony.Trunk().ExternalDisplayedNumber().v6().validate({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    number: externalNumber.number
                }, {}).$promise.then(function (response) {
                    self.validationCode = response.validationCode;
                });
            }

            // reset model
            resetModel();

            // launch validation if needed
            return validationPromise.then(function () {
                if (self.list.length === 1) {
                    startPolling();
                }
                $timeout(function () {
                    self.externalNumberAddForm.number.$setValidity("required", true);
                }, 50);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_trunk_external_number_add_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.add = false;
        });
    };

    self.onCancelBtnClick = function () {
        resetModel();
    };

    self.onConfirmDeleteNumberBtnClick = function () {
        self.loading.remove = true;

        return OvhApiTelephony.Trunk().ExternalDisplayedNumber().v6().remove({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            number: self.toDelete.number
        }).$promise.then(function () {
            _.remove(self.list, function (number) {
                return number.number === self.toDelete.number;
            });
            Toast.success($translate.instant("telephony_trunk_external_number_delete_success"));
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_trunk_external_number_delete_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.toDelete = null;
            self.validationCode = null;
            self.loading.remove = false;
        });
    };

    /* -----  End of EVENTS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);
            self.plan = NumberPlans.getPlanByNumber(self.line);
            self.isVip = TelecomMediator.isVip;
            self.model.autoValidation = self.isVip;

            return fetchExternalDisplayedNumber().then(function (numbers) {
                self.list = numbers;

                if (self.list.length > 0) {
                    startPolling();
                }
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_trunk_external_number_load_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    $scope.$on("$destroy", function () {
        stopPolling();
    });

    /* -----  End of INITIALIZATION  ------ */

});
