angular.module("managerApp").factory("TelephonyGroupFax", function (Telephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupFax (optionsParam) {
        var options = optionsParam;

        if (!options) {
            options = {};
        }

        // options check
        if (!options.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupFax");
        }

        if (!options.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupFax");
        }

        // mandatory
        this.billingAccount = options.billingAccount;
        this.serviceName = options.serviceName;

        // from API
        this.serviceType = options.serviceType;
        this.description = options.description;
        this.offers = options.offers;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.isFax = true;

        // helper
        this.isSip = _.some(this.offers, function (offer) {
            return angular.isString(offer) && offer.indexOf("sipfax") >= 0;
        });
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupFax.prototype.getDisplayedName = function () {
        var self = this;

        return self.description || self.serviceName;
    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroupFax.prototype.save = function () {
        var self = this;

        return Telephony.Fax().Lexi().edit({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            description: self.description
        }).$promise;
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupFax.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            description: angular.copy(self.description)
        };

        return self;
    };

    TelephonyGroupFax.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.description = angular.copy(self.saveForEdition.description);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupFax;

});
