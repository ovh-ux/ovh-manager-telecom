angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingCreditThresholdCtrl", function ($q, $state, $stateParams, $translate, $timeout, OvhApiOrderTelephony, OvhApiTelephony, ToastError) {
    "use strict";
    var self = this;

    self.loading = {
        init: true,
        submit: false,
        success: false
    };

    self.creditThreshold = null;
    self.allowedOutPlan = null;
    self.allowedOutplan = null;
    self.credits = [];
    self.credit = null;
    self.newCredit = null;
    self.contractsAccepted = false;
    self.contracts = [];

    function init () {
        self.loading.init = true;

        $q.all({
            billingAccount: self.getBillingAccount(),
            credits: self.getAllowedCreditThreshold(),
            contracts: self.getContracts()
        }).then(function (data) {
            self.creditThreshold = data.billingAccount.creditThreshold;
            self.currentOutplan = data.billingAccount.currentOutplan;
            self.allowedOutplan = data.billingAccount.allowedOutplan;
            self.credits = _.map(data.credits, function (credit) {
                return {
                    label: credit.text + " " + $translate.instant("telephony_group_billing_credit_threshold_without_tax"),
                    value: credit,
                    disable: credit.value === self.creditThreshold.value
                };
            });
            self.contracts = data.contracts.contracts;
            self.contractsAccepted = false;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    self.onChangeCredit = function () {
        if (self.credit) {
            self.newCredit = self.credit.value;
        }
    };

    self.submit = function () {
        self.loading.submit = true;

        return OvhApiTelephony.v6().edit({
            billingAccount: $stateParams.billingAccount
        }, {
            creditThreshold: self.newCredit
        }).$promise.then(function () {
            self.loading.success = true;
            $timeout(function () {
                $state.reload();
            }, 5000);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.submit = false;
        });
    };

    self.getBillingAccount = function () {
        return OvhApiTelephony.v6().get({
            billingAccount: $stateParams.billingAccount
        }).$promise;
    };

    self.getAllowedCreditThreshold = function () {
        return OvhApiTelephony.v6().allowedCreditThreshold({
            billingAccount: $stateParams.billingAccount
        }).$promise;
    };

    self.getContracts = function () {
        return OvhApiOrderTelephony.v6().getNewBillingAccount().$promise;
    };

    init();
});
