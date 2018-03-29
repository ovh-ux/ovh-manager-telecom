angular.module("managerApp")
    .controller("FreeFaxCreditCtrl", function (FREEFAX, $stateParams, ToastError, OvhApiFreeFax) {
        "use strict";
        var self = this;

        function init () {
            self.cost = "";
            self.contracts = [];

            self.creditChoices = FREEFAX.discreteCredit.map(function (val) {
                return {
                    label: val,
                    value: val
                };
            });

            self.orderDone = false;
            self.bill = null;
            self.quantity = null;
        }

        self.getPrice = function (amount) {
            self.contracts = [];
            self.cost = null;
            OvhApiFreeFax.v6().getPrice({
                quantity: amount
            }).$promise.then(function (data) {
                self.cost = data.prices;
                var detail = _.head(data.details);
                self.quantity = detail.quantity;
                self.contracts = data.contracts;
            }, function (err) {
                self.cost = "";
                return new ToastError(err);
            });
        };

        self.order = function (amount) {
            self.orderDone = true;
            OvhApiFreeFax.v6().orderCredits(null, {
                quantity: amount
            }).$promise.then(function (response) {
                var detail = _.head(response.details);
                self.bill = {
                    url: response.url,
                    total: response.prices.withTax.text,
                    id: response.orderId,
                    quantity: detail.quantity
                };
            }, function (err) {
                init();
                return new ToastError(err);
            });
        };

        init();
    });
