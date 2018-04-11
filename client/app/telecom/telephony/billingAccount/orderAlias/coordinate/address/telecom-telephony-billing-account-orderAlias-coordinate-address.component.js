angular.module("managerApp").component("telecomTelephonyBillingAccountOrderAliasCoordinateAddress", {
    templateUrl: "app/telecom/telephony/billingAccount/orderAlias/coordinate/address/telecom-telephony-billing-account-orderAlias-coordinate-address.html",
    bindings: {
        ngModel: "=?",
        regionCode: "@",
        ngDisabled: "=?"
    },
    controller: function ($scope, OvhApiNewAccount) {
        "use strict";
        var self = this;

        this.validator = {
            isZipcode: function () {
                return true;
            }
        };

        this.getValidator = function () {
            if (this.regionCode) {
                OvhApiNewAccount.CreationRules().v6().get({
                    country: this.regionCode === "uk" ? "GB" : this.regionCode.toUpperCase(),
                    legalform: "corporation",
                    ovhCompany: "ovh",
                    ovhSubsidiary: "FR"
                }).$promise.then(function (rules) {
                    var zipCodeRegexp = _.get(rules, "zip.regularExpression");
                    if (zipCodeRegexp) {
                        self.validator.isZipcode = function (value) {
                            return new RegExp(zipCodeRegexp).test(value);
                        };
                    }
                    return self.validator;
                });
            }
        };

        $scope.$watch("$ctrl.regionCode", function (newVal, oldVal) {
            if (newVal !== oldVal) {
                self.getValidator();
            }
        });

        this.$onInit = function () {
            return this.getValidator();
        };
    }
});
