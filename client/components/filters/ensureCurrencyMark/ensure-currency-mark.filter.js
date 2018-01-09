angular.module("managerApp").filter("ensureCurrencyMark", function () {
    "use strict";
    const weirdChar = "�";

    return function (priceText, mark) {
        var ensurePriceText = _.trim(priceText, weirdChar);
        ensurePriceText = _.endsWith(ensurePriceText, mark) ? ensurePriceText : ensurePriceText += mark;

        return ensurePriceText;
    };
});
