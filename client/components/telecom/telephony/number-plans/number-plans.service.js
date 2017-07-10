angular.module("managerApp").service("NumberPlans", function (TELEPHONY_NUMBER_PLANS) {
    "use strict";

    this.getPlanByNumber = function (number) {
        var prefixedNumber;
        var foundedPlan;

        if (number) {
            prefixedNumber = number.serviceName.replace(/^00/, "+");
            foundedPlan = _.find(TELEPHONY_NUMBER_PLANS, function (plan) {
                var founded = prefixedNumber.indexOf(plan.prefix) === 0;
                return founded;
            });
        }

        return foundedPlan;
    };

});
