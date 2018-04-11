angular.module("managerApp").factory("TelephonyGroupNumberEasyHunting", function ($q, VoipScheduler, VoipTimeCondition, OvhApiTelephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberEasyHunting (featureOptions) {

        // check for mandatory options
        if (!featureOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupNumberEasyHunting");
        } else {
            if (!featureOptions.billingAccount) {
                throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberEasyHunting");
            }

            if (!featureOptions.serviceName) {
                throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberEasyHunting");
            }

            if (!featureOptions.featureType) {
                throw new Error("featureType option must be specified when creating a new TelephonyGroupNumberEasyHunting");
            }
        }

        // set mandatory attributes
        this.billingAccount = featureOptions.billingAccount;
        this.serviceName = featureOptions.serviceName;
        this.featureType = featureOptions.featureType;

        // set feature options
        this.setOptions(featureOptions);

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;

        this.scheduler = null;
        this.timeCondition = null;
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.setOptions = function () {
        var self = this;

        return self;
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.isCcs = function () {
        var self = this;

        return self.featureType === "contactCenterSolution";
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = {
            featureType: angular.copy(self.featureType)
        };

        return self;
    };

    TelephonyGroupNumberEasyHunting.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.featureType = angular.copy(self.saveForEdition.featureType);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberEasyHunting.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
        }
        return self.hasChange("featureType");
    };

    /* ----------  SCHEDULER  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.getScheduler = function () {
        var self = this;

        if (!self.scheduler) {
            self.scheduler = new VoipScheduler({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            });
        }

        return self.scheduler.get();
    };

    /* ----------  TIMECONDITION  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.getTimeCondition = function () {
        var self = this;

        if (!self.timeCondition) {
            self.timeCondition = new VoipTimeCondition({
                featureType: "easyHunting",
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            });
        }

        return self.timeCondition.init();
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.inPendingState = function () {
        return false;
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupNumberEasyHunting.prototype.init = function (resetCache) {
        var self = this;

        if (resetCache) {
            OvhApiTelephony.EasyHunting().v6().resetAllCache();
        }

        return OvhApiTelephony.EasyHunting().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (featureOptions) {
            return self.setOptions(featureOptions);
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberEasyHunting;

});
