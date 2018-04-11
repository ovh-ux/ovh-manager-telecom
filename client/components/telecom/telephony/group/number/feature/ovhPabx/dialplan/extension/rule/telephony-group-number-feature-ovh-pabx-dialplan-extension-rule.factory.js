angular.module("managerApp").factory("TelephonyGroupNumberOvhPabxDialplanExtensionRule", function ($q, OvhApiTelephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberOvhPabxDialplanExtensionRule (ruleOptionsParam) {
        var ruleOptions = ruleOptionsParam;

        if (!ruleOptions) {
            ruleOptions = {};
        }

        // check for mandatory options
        if (!ruleOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtensionRule");
        }

        if (!ruleOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtensionRule");
        }

        if (!ruleOptions.dialplanId) {
            throw new Error("dialplanId option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtensionRule");
        }

        if (!ruleOptions.extensionId) {
            throw new Error("extensionId option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtensionRule");
        }

        // set mandatory attributes
        this.billingAccount = ruleOptions.billingAccount;
        this.serviceName = ruleOptions.serviceName;
        this.dialplanId = ruleOptions.dialplanId;
        this.extensionId = ruleOptions.extensionId;

        // other attributes
        this.ruleId = ruleOptions.ruleId || _.random(_.now());
        this.actionParam = null;
        this.action = null;
        this.negativeAction = null;
        this.position = null;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.status = null;
        this.ivrMenu = null;

        // set feature options
        this.setInfos(ruleOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.setInfos = function (ruleOptionsParam) {
        var self = this;
        var ruleOptions = ruleOptionsParam;

        if (!ruleOptions) {
            ruleOptions = {};
        }

        self.action = ruleOptions.action || "setCallerName";
        self.negativeAction = !_.isUndefined(ruleOptions.negativeAction) ? ruleOptions.negativeAction : false;
        self.position = ruleOptions.position || null;
        self.status = ruleOptions.status || "OK";

        // special rule for action param
        if (self.getActionFamily() === "sleep") {
            self.actionParam = ruleOptions.actionParam ? parseInt(ruleOptions.actionParam, 10) : 1000;
        } else if (["playback", "ivr", "hunting", "tts"].indexOf(self.getActionFamily()) !== -1) {
            self.actionParam = ruleOptions.actionParam ? parseInt(ruleOptions.actionParam, 10) : "";
        } else {
            self.actionParam = ruleOptions.actionParam || "";
        }

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.getActionFamily = function (actionParam) {
        var self = this;
        var action = actionParam;

        if (!action) {
            action = self.action;
        }

        switch (action) {
        case "playback":
        case "endless_playback":
            return "playback";
        default:
            return action;
        }
    };

    /* ----------  API CALLS  ----------*/

    /* ----------  SAVE RULE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.save = function () {
        var self = this;

        self.status = "SAVING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId,
            ruleId: self.ruleId
        }, {
            action: self.action,
            actionParam: self.actionParam
        }).$promise.then(function () {
            self.status = "OK";
            return self;
        });
    };

    /* ----------  CREATE RULE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.create = function () {
        var self = this;

        self.status = "CREATING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().create({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }, {
            action: self.action,
            actionParam: self.actionParam,
            position: self.position,
            negativeAction: self.negativeAction
        }).$promise.then(function (ruleOptions) {
            self.status = "OK";
            self.ruleId = ruleOptions.ruleId;
            return self;
        });
    };

    /* ----------  DELETE RULE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.remove = function () {
        var self = this;

        self.status = "DELETING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().remove({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId,
            ruleId: self.ruleId
        }).$promise.catch(function (error) {
            self.status = "OK";
            return $q.reject(error);
        });
    };

    /* ----------  MOVE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.move = function (newPosition) {
        var self = this;

        self.status = "MOVING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId,
            ruleId: self.ruleId
        }, {
            position: newPosition
        }).$promise.then(function () {
            self.position = newPosition;
            self.status = "OK";
            return self;
        });
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = {
            actionParam: angular.copy(self.actionParam),
            action: angular.copy(self.action),
            status: angular.copy(self.status),
            actionParamInfos: angular.copy(self.actionParamInfos)
        };

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.stopEdition = function (cancel, saveForEdition) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.actionParam = angular.copy(self.saveForEdition.actionParam);
            self.action = angular.copy(self.saveForEdition.action);
            self.status = angular.copy(self.saveForEdition.status);
            self.actionParamInfos = angular.copy(self.saveForEdition.actionParamInfos);
        } else if (saveForEdition && cancel) {
            self.actionParam = angular.copy(saveForEdition.actionParam);
            self.action = angular.copy(saveForEdition.action);
            self.status = angular.copy(saveForEdition.status);
            self.actionParamInfos = angular.copy(saveForEdition.actionParamInfos);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtensionRule.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
        }
        return self.hasChange("action") || self.hasChange("actionParam");
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberOvhPabxDialplanExtensionRule;

});
