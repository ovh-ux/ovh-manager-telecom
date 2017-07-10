angular.module("managerApp").controller("TelecomTelephonyBillingAccountBillingCalledFeesCtrl", function ($filter, $q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.consumptions = {
            raw: [],
            totalPrice: null,
            groupedByDialedNumber: [],
            isLoading: false
        };
        self.consumptions.isLoading = true;
        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            return group.getRepaymentConsumption().then(function (repaymentConsumptions) {
                self.consumptions.raw = _.get(repaymentConsumptions, "calledFees");
                self.consumptions.totalPrice = $filter("number")(-_.chain(self.consumptions.raw).sum("price").round(2).value(), 2);
                var dialedNumbers = _.chain(self.consumptions.raw).groupBy("dialed").keysIn().value();
                self.consumptions.groupedByDialedNumber = _.map(dialedNumbers, function (dialed) {
                    var consumptions = _.filter(self.consumptions.raw, { dialed: dialed });
                    var totalPrice = -_.chain(consumptions).sum("price").round(2).value();
                    var operators = _.chain(consumptions).groupBy("operator").keysIn().value();
                    var details = _.map(operators, function (operator) {
                        var operatorConsumptions = _.filter(consumptions, { operator: operator });
                        var totalOperatorPrice = -_.chain(operatorConsumptions).sum("price").round(2).value();
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
            Toast.error([$translate.instant("telephony_group_billing_called_fees_error"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.consumptions.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
