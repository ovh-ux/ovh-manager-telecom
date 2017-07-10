angular.module("managerApp").controller("TelecomTelephonyAliasPortabilitiesCtrl", function ($stateParams, $q, Telephony, ToastError) {
    "use strict";

    var self = this;

    self.serviceName = $stateParams.serviceName;

    function fetchPortability () {
        return Telephony.Portability().Lexi().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return Telephony.Portability().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    id: id
                }).$promise.then(function (porta) {
                    return Telephony.Portability().Lexi().getStatus({
                        billingAccount: $stateParams.billingAccount,
                        id: id
                    }).$promise.then(function (steps) {
                        porta.steps = steps;
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
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });
    }

    init();
});
