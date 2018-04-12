angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingDepositMovementCtrl", function ($q, $state, $timeout, $translate, OvhApiTelephony, ToastError, Toast) {
    "use strict";
    var self = this;

    self.loading = {
        init: true,
        submit: false,
        success: false
    };

    self.sources = [];
    self.source = null;
    self.targets = [];
    self.target = null;
    self.amount = 0;
    self.currency = "";

    function init () {
        self.loading.init = true;

        self.getEnabledBillingAccounts().then(function (billingAccountsParam) {
            var billingAccounts = _.map(billingAccountsParam, function (item) {
                return {
                    label: item.description || item.billingAccount,
                    value: item
                };
            });
            billingAccounts = _.sortBy(billingAccounts, "label");
            self.sources = billingAccounts;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    self.submit = function () {
        self.loading.submit = true;

        return OvhApiTelephony.v6().transferSecurityDeposit({
            billingAccount: self.source.billingAccount
        }, {
            amount: self.amount,
            billingAccountDestination: self.target.billingAccount
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

    self.onChangeSource = function () {
        self.targets = [];
        self.currency = self.source.securityDeposit.currencyCode === "EUR" ? "€" : self.source.securityDeposit.currencyCode;
        self.amount = 0;

        var targets = _.filter(self.sources, function (item) {
            return item.value.billingAccount !== self.source.billingAccount;
        });

        // disable target if not the same billing contact than source
        return $q.all(

            // build a billingAccount->promise object of all the requests to canTransferSecurityDeposit
            _.reduce(
                targets,
                function (obj, value) {
                    var billingAccount = _.get(value, "value.billingAccount");
                    obj[billingAccount] = OvhApiTelephony.v6().canTransferSecurityDeposit(
                        {
                            billingAccount: self.source.billingAccount
                        }, {
                            billingAccountDestination: billingAccount
                        }).$promise.then(function (data) {
                            return data.value;
                        }).catch(function (err) {
                            if (err.status === 400) { // means that deposit cannot be transfered
                                return false;
                            }
                            return $q.reject(err);
                        });
                    return obj;
                },
                {}
            )
        ).then(function (billingAccountTransfertStatus) {
            _.each(targets, function (target) {
                target.disable = !billingAccountTransfertStatus[_.get(target, "value.billingAccount")];
            });
            self.targets = targets;
        }).catch(function (err) {
            Toast.error($translate.instant("telephony_group_billing_deposit_movement_capability_error"));
            return $q.reject(err);
        });
    };

    self.getEnabledBillingAccounts = function () {
        return OvhApiTelephony.Aapi().billingAccounts().$promise.then(function (billingAccounts) {
            return _.filter(billingAccounts, { status: "enabled" });
        });
    };

    self.getServiceInfos = function (billingAccount) {
        return OvhApiTelephony.v6().getServiceInfos({
            billingAccount: billingAccount
        }).$promise;
    };

    init();
});
