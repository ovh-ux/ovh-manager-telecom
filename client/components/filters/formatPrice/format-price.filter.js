angular.module("managerApp").filter("formatPrice", function ($sce, $translate) {
    "use strict";

    return function (priceText, options) {
        var priceTag;
        var additionalTag;
        var formatedPrice;

        // set default values
        var myOptions = angular.extend({
            withoutTax: true,
            additionalText: "",
            addBrackets: false
        }, options || {});

        priceTag = "<span class=\"text-price\">" + priceText + "</span>";

        if (myOptions.withoutTax) {
            additionalTag = "<span class=\"price-infos\">" + $translate.instant("common_monthly_without_tax") + (myOptions.additionalText ? myOptions.additionalText : "") + "</span>";
            formatedPrice = $sce.trustAsHtml([priceTag, additionalTag].join(" "));
        } else {
            formatedPrice = $sce.trustAsHtml(priceTag);
        }

        if (myOptions.addBrackets) {
            return ["(", formatedPrice, ")"].join("");
        }
        return formatedPrice;

    };
});
