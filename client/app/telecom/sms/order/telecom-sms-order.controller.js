angular.module("managerApp").controller("TelecomSmsOrderCtrl", function ($q, $translate, $filter, $stateParams, SmsMediator, Order, debounce, Toast, SMS_ORDER_PREFIELDS_VALUES) {
    "use strict";

    var self = this;

    this.loading = {
        init: false,
        order: false,
        prices: false
    };

    this.order = {
        account: null,
        credit: null,
        customCredit: 100,
        max: 1000000,
        min: 100
    };

    this.contracts = null;
    this.contractsAccepted = false;
    this.availableAccounts = null;
    this.availableCredits = null;

    /*= =====================================
        =            INITIALIZATION            =
        ======================================*/

    function init () {
        self.loading.init = true;

        self.availableCredits = [];
        _.forEach(SMS_ORDER_PREFIELDS_VALUES, function (value, idx) {
            self.availableCredits.push({
                label: isNaN(value) ? $translate.instant("sms_order_credit_custom") : $filter("number")(value),
                value: value
            });
            if (value === self.order.min) {
                self.order.credit = self.availableCredits[idx];
            }
        });

        SmsMediator.initAll().then(function () {
            var availableAccounts = _.toArray(SmsMediator.getAccounts()).sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            // We have to format it to become human readable
            _.forEach(availableAccounts, function (account, idx) {
                // if no description, take sms id
                if (account.description === "") {
                    account.label = account.name;
                } else if (account.description !== account.name) {
                    account.label = account.description + " (" + account.name + ")";
                } else {
                    account.label = account.name;
                }

                // If we are on a service, preselect
                if (account.name === $stateParams.serviceName) {
                    self.order.account = availableAccounts[idx];
                }
            });

            var newAccount = {
                name: "new",
                description: "",
                label: $translate.instant("sms_order_new_account")
            };
            availableAccounts.push(newAccount);

            self.availableAccounts = availableAccounts;

            if (!self.order.account) {
                self.order.account = self.availableAccounts[self.availableAccounts.length - 1];
            }
        }).then(function () {
            self.loading.init = false;
        }).then(function () {
            return self.getPrices();
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    this.customCreditSelected = function customCreditSelected () {
        return self.order.credit.label && self.order.credit.label === $translate.instant("sms_order_credit_custom");
    };

    function getSelectedCredit () {
        if (self.customCreditSelected()) {
            return self.order.customCredit;
        }
        return self.order.credit.value;
    }

    function isAccountCreation () {
        return self.order.account.name === "new";
    }

    this.getPrices = function () {
        self.loading.prices = true;
        self.contracts = null;
        self.prices = null;
        self.contractsAccepted = false;

        if (isAccountCreation()) {
            return Order.Sms().Lexi().getNewSmsAccount({
                quantity: getSelectedCredit()
            }).$promise.then(function (newAccountPriceDetails) {
                self.contracts = newAccountPriceDetails.contracts;
                self.prices = newAccountPriceDetails;
                return self.prices;
            }, function (error) {
                Toast.error($translate.instant("sms_order_ko"));
                return $q.reject(error);
            }).finally(function () {
                self.loading.prices = false;
            });
        }
        return Order.Sms().Lexi().getCredits({
            serviceName: self.order.account.name,
            quantity: getSelectedCredit()
        }).$promise.then(function (priceDetails) {
            self.contracts = priceDetails.contracts;
            self.prices = priceDetails;
        }, function () {
            Toast.error($translate.instant("sms_order_ko"));
        }).finally(function () {
            self.loading.prices = false;
        });

    };

    this.doOrder = function () {
        self.loading.order = true;
        self.prices.url = null;

        if (isAccountCreation()) {
            return Order.Sms().Lexi().orderNewSmsAccount({}, {
                quantity: getSelectedCredit()
            }).$promise.then(function (newAccountPriceDetails) {
                self.prices.url = newAccountPriceDetails.url;
                return self.prices.url;
            }, function () {
                Toast.error($translate.instant("sms_order_ko"));
            }).finally(function () {
                self.loading.order = false;
            });
        }
        return Order.Sms().Lexi().orderCredits({
            serviceName: self.order.account.name
        }, {
            quantity: getSelectedCredit()
        }).$promise.then(function (priceDetails) {
            self.prices.url = priceDetails.url;
        }, function () {
            Toast.error($translate.instant("sms_order_ko"));
        }).finally(function () {
            self.loading.order = false;
        });

    };

    this.getDebouncedPrices = debounce(self.getPrices, 500, false);

    init();
}
);
