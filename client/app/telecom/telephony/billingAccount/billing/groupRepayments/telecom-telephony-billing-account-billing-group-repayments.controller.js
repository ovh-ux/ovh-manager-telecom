angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingGroupRepaymentsCtrl", function ($q, $stateParams, $translate, OvhApiTelephony, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    /* =============================
    =            EVENTS            =
    ============================== */

    self.askHistoryRepaymentConsumption = function () {
        self.groupRepaymentsForm.isAsking = true;

        return OvhApiTelephony.HistoryRepaymentConsumption().v6().create({
            billingAccount: $stateParams.billingAccount
        }, {
            billingNumber: self.groupRepaymentsForm.billingNumber
        }).$promise.then(function () {
            Toast.success($translate.instant("telephony_group_billing_group_repayments_ask_new_repayment_success"));
            init();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_group_billing_group_repayments_ask_new_repayment_error"), _.get(error, "data.message")].join(" "));
            init();
            return $q.reject(error);
        }).finally(function () {
            self.groupRepaymentsForm.isAsking = false;
        });
    };

    /* -----  End of EVENTS  ------ */


    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.consumptions = {
            all: [],
            raw: [],
            hasAmountAvailable: null,
            total: {
                duration: null,
                price: null,
                call: null
            },
            repayable: {
                price: null,
                call: null
            },
            deferred: {
                price: null,
                call: null
            },
            isLoading: false
        };

        self.groupRepaymentsForm = {
            billingNumber: null,
            isAsking: false
        };

        self.consumptions.isLoading = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getRepaymentConsumption().then(function (repaymentConsumptions) {
                self.consumptions.all = _.get(repaymentConsumptions, "groupRepayments.all");
                self.consumptions.raw = _.get(repaymentConsumptions, "groupRepayments.raw");

                // total
                self.consumptions.total.duration = _.sum(self.consumptions.raw, "duration");
                self.consumptions.total.price = _.chain(self.consumptions.raw).sum("price").floor(2).value();
                self.consumptions.total.call = _.chain(self.consumptions.all).size().value();

                // repayable
                var repayable = _.chain(self.consumptions.all).filter("repayable");
                self.consumptions.repayable.price = repayable.pluck("price").sum().floor(2).value();
                self.consumptions.repayable.call = repayable.size().value();
                self.consumptions.hasAmountAvailable = _.find(self.consumptions.raw, "repayable");

                // deferred
                self.consumptions.deferred.price = _.floor(self.consumptions.total.price - self.consumptions.repayable.price, 2);
                self.consumptions.deferred.call = self.consumptions.total.call - self.consumptions.repayable.call;

                var dialedNumbers = _.chain(self.consumptions.raw).groupBy("dialed").keysIn().value();
                self.consumptions.groupedByDialedNumber = _.map(dialedNumbers, function (dialed) {
                    var consumptions = _.filter(self.consumptions.raw, { dialed: dialed });
                    var totalPrice = _.chain(consumptions).sum("price").round(2).value();
                    var operators = _.chain(consumptions).groupBy("operator").keysIn().sort()
                        .value();
                    var details = _.map(operators, function (operator) {
                        var operatorConsumptions = _.filter(consumptions, { operator: operator });
                        var totalOperatorPrice = _.chain(operatorConsumptions).sum("price").round(2).value();
                        return {
                            operator: operator,
                            totalOperatorConsumption: _.size(operatorConsumptions),
                            totalOperatorDuration: _.sum(operatorConsumptions, "duration"),
                            totalOperatorPrice: totalOperatorPrice
                        };
                    });
                    return {
                        dialed: dialed,
                        totalConsumption: _.size(consumptions),
                        totalDuration: _.sum(consumptions, "duration"),
                        totalPrice: totalPrice,
                        details: details
                    };
                });
                return repaymentConsumptions;
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_group_billing_group_repayments_error"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.consumptions.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
