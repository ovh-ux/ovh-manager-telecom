angular.module("managerApp").component("telecomTelephonyBillingAccountOrderAliasCoordinateIdentity", {
    templateUrl: "app/telecom/telephony/billingAccount/orderAlias/coordinate/identity/telecom-telephony-billing-account-orderAlias-coordinate-identity.html",
    bindings: {
        ngModel: "=?",
        ngDisabled: "=?",
        organisation: "@",
        regionCode: "@"
    },
    controller: function (validator) {
        "use strict";
        this.validator = validator;
    }
});
