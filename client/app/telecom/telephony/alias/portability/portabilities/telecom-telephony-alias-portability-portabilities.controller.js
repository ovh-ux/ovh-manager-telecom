angular.module("managerApp").controller("TelecomTelephonyAliasPortabilitiesCtrl", function ($translate, $stateParams, $q, OvhApiTelephony, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        cancel: false
    };

    self.serviceName = $stateParams.serviceName;

    function fetchPortability () {
        return OvhApiTelephony.Portability().v6().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.Portability().v6().get({
                    billingAccount: $stateParams.billingAccount,
                    id: id
                }).$promise.then(function (porta) {
                    return $q.all({
                        steps: OvhApiTelephony.Portability().v6().getStatus({
                            billingAccount: $stateParams.billingAccount,
                            id: id
                        }).$promise,
                        canBeCancelled: OvhApiTelephony.Portability().v6().canBeCancelled({
                            billingAccount: $stateParams.billingAccount,
                            id: id
                        }).$promise
                    }).then(function (results) {
                        porta.steps = results.steps;
                        porta.canBeCancelled = results.canBeCancelled.value;
                        return porta;
                    });
                });
            }));
        });
    }

    function groupPortaByNumbers (portabilities) {
        var numbers = [];
        _.forEach(portabilities, function (porta) {
            _.forEach(porta.numbersList, function (number) {
                numbers.push({
                    number: number,
                    portability: porta,
                    lastStepDone: _.find(porta.steps.slice().reverse(), { status: "done" })
                });
            });
        });
        return numbers;
    }

    function init () {
        self.isLoading = true;
        fetchPortability().then(function (result) {
            self.numbers = groupPortaByNumbers(result);
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_portabilities_load_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    self.confirmCancelPortability = function (portability) {
        self.loading.cancel = true;

        return OvhApiTelephony.Portability().v6().cancel({
            billingAccount: $stateParams.billingAccount,
            id: portability.id
        }, {}).$promise.then(function () {
            Toast.success($translate.instant("telephony_alias_portabilities_cancel_success"));
            return init();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_portabilities_cancel_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.cancel = false;
        });
    };

    init();
});
