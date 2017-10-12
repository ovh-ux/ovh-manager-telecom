angular.module("managerApp").factory("TelephonyGroupNumberFeature", function ($q) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberFeature (mandatoryOptions, featureOptionsParam) {
        var featureOptions = featureOptionsParam;

        // check for mandatory options
        if (!mandatoryOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupNumberFeature");
        } else {
            if (!mandatoryOptions.billingAccount) {
                throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberFeature");
            }

            if (!mandatoryOptions.serviceName) {
                throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberFeature");
            }

            if (!mandatoryOptions.featureType) {
                throw new Error("featureType option must be specified when creating a new TelephonyGroupNumberFeature");
            }
        }

        if (!featureOptions) {
            featureOptions = {};
        }

        // set mandatory attributes
        this.billingAccount = mandatoryOptions.billingAccount;
        this.serviceName = mandatoryOptions.serviceName;
        this.featureType = mandatoryOptions.featureType;

        // set feature options
        this.setInfos(featureOptions);

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberFeature.prototype.setInfos = function (featureOptions) {
        var self = this;

        angular.forEach(_.keys(featureOptions), function (featureOptionKey) {
            self[featureOptionKey] = featureOptions[featureOptionKey];
        });

        return self;
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberFeature.prototype.startEdition = function (attrsToSave) {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {};
        angular.forEach(attrsToSave || ["featureType"], function (attr) {
            self.saveForEdition[attr] = angular.copy(self[attr]);
        });

        return self;
    };

    TelephonyGroupNumberFeature.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            angular.forEach(_.keys(self.saveForEdition), function (editionKey) {
                self[editionKey] = angular.copy(self.saveForEdition[editionKey]);
            });
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberFeature.prototype.hasChange = function (attr) {
        var self = this;
        var hasChange = false;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return self[attr] !== self.saveForEdition[attr];
        }
        angular.forEach(_.keys(self.saveForEdition), function (attrKey) {
            if (!hasChange) {
                hasChange = self.hasChange(attrKey);
            }
        });

        return hasChange;

    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberFeature.prototype.inPendingState = function () {
        return false;
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupNumberFeature.prototype.init = function () {
        var self = this;

        return $q.when(self);
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberFeature;

});
