angular.module("managerApp").factory("TelephonyGroupNumberOvhPabxDialplanExtension", function ($q, OvhApiTelephony, TelephonyGroupNumberOvhPabxDialplanExtensionRule, VoipScreenScreenList, VoipTimeConditionCondition) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberOvhPabxDialplanExtension (extensionOptionsParam) {
        var extensionOptions = extensionOptionsParam;

        if (!extensionOptions) {
            extensionOptions = {};
        }

        // check for mandatory options
        if (!extensionOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtension");
        }

        if (!extensionOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtension");
        }

        if (!extensionOptions.dialplanId) {
            throw new Error("dialplanId option must be specified when creating a new TelephonyGroupNumberOvhPabxDialplanExtension");
        }

        // set mandatory attributes
        this.billingAccount = extensionOptions.billingAccount;
        this.serviceName = extensionOptions.serviceName;
        this.dialplanId = extensionOptions.dialplanId;

        // other attributes
        this.extensionId = extensionOptions.extensionId;
        this.position = null;
        this.screenListType = null;
        this.enabled = null;
        this.schedulerCategory = null;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.status = null;
        this.rules = [];
        this.negativeRules = [];
        this.timeConditions = [];
        this.screenListConditions = [];

        // set feature options
        this.setInfos(extensionOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.setInfos = function (extensionOptionsParam) {
        var self = this;
        var extensionOptions = extensionOptionsParam;

        if (!extensionOptions) {
            extensionOptions = {};
        }

        self.position = extensionOptions.position;
        self.screenListType = extensionOptions.screenListType || null;
        self.schedulerCategory = extensionOptions.schedulerCategory || null;
        self.enabled = !_.isUndefined(extensionOptions.enabled) ? extensionOptions.enabled : true;
        self.status = extensionOptions.status || "OK";

        return self;
    };

    /* ----------  ACTIONS  ----------*/

    /* ----------  CREATE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.create = function () {
        var self = this;

        self.status = "IN_CREATION";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().create({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId
        }, {
            enable: self.enabled,
            position: self.position,
            schedulerCategory: self.schedulerCategory,
            screenListType: self.screenListType
        }).$promise.then(function (extensionOptions) {
            self.status = "OK";
            self.extensionId = extensionOptions.extensionId;
            return self;
        });
    };

    /* ----------  SAVE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.save = function () {
        var self = this;

        self.status = "SAVING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }, {
            schedulerCategory: self.schedulerCategory,
            screenListType: self.screenListType
        }).$promise.finally(function () {
            self.status = "OK";
        });
    };

    /* ----------  ENABLE/DISABLE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.enable = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }, {
            enabled: true
        }).$promise.then(function () {
            self.enabled = true;
            return self;
        });
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.disable = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }, {
            enabled: false
        }).$promise.then(function () {
            self.enabled = false;
            return self;
        });
    };

    /* ----------  DELETE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.remove = function () {
        var self = this;

        self.status = "DELETING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().remove({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }).$promise.catch(function (error) {
            self.status = "OK";
            return $q.reject(error);
        });
    };

    /* ----------  MOVE  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.move = function (newPosition) {
        var self = this;

        self.status = "MOVING";

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }, {
            position: newPosition
        }).$promise.then(function () {
            self.position = newPosition;
            self.status = "OK";
            return self;
        });
    };

    /* ----------  RULES  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.getRules = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }).$promise.then(function (ruleIds) {
            return $q.all(_.map(_.chunk(ruleIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Dialplan().Extension().Rule().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    dialplanId: self.dialplanId,
                    extensionId: self.extensionId,
                    ruleId: chunkIds
                }).$promise.then(function (resources) {
                    angular.forEach(_.chain(resources).filter(function (resource) {
                        return resource.value !== null;
                    }).map("value").sortBy("position").value(), function (ruleOptions) {
                        self.addRule(ruleOptions);
                    });
                });
            })).then(function () {
                return self;
            });
        });
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.addRule = function (ruleOptionsParam) {
        var self = this;
        var rule = null;
        var ruleList;
        var ruleOptions = ruleOptionsParam;

        if (!ruleOptions) {
            ruleOptions = {};
        }

        ruleList = ruleOptions.negativeAction ? self.negativeRules : self.rules;

        if (ruleOptions.ruleId) {
            rule = _.find(ruleList, {
                ruleId: ruleOptions.ruleId
            });
        }

        if (rule) {
            rule.setInfos(ruleOptions);
        } else {
            rule = new TelephonyGroupNumberOvhPabxDialplanExtensionRule(angular.extend(ruleOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                dialplanId: self.dialplanId,
                extensionId: self.extensionId
            }));
            ruleList.push(rule);
        }

        return rule;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.removeRule = function (rule) {
        var self = this;

        _.remove(rule.negativeAction ? self.negativeRules : self.rules, rule);

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.updateRulesPositions = function (from, forNegativeActions) {
        var self = this;
        var updatePositionPromises = [];
        var ruleList = forNegativeActions ? self.negativeRules : self.rules;
        var rulesToUpdate = from ? _.filter(ruleList, function (rule) {
            return rule.position > from;
        }) : ruleList;

        angular.forEach(rulesToUpdate, function (rule) {
            updatePositionPromises.push(rule.move(from ? rule.position - 1 : rule.position));
        });

        return $q.allSettled(updatePositionPromises);
    };

    /* ----------  SCREEN LIST CONDITIONS  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.getScreenListConditions = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionScreenList().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }).$promise.then(function (ruleIds) {
            return $q.all(_.map(_.chunk(ruleIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionScreenList().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    dialplanId: self.dialplanId,
                    extensionId: self.extensionId,
                    conditionId: chunkIds
                }).$promise.then(function (resources) {
                    _.chain(resources).filter(function (resource) {
                        return resource.value !== null;
                    }).map("value").sortBy("conditionId").value().forEach(function (screenListOptions) {
                        self.addScreenListCondition(screenListOptions);
                    });
                });
            })).then(function () {
                return self;
            });
        });
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.addScreenListCondition = function (screenListOptionsParam) {
        var self = this;
        var condition = null;
        var screenListOptions = screenListOptionsParam;

        if (!screenListOptions) {
            screenListOptions = {};
        }

        if (screenListOptions.conditionId) {
            condition = _.find(self.screenListConditions, {
                conditionId: screenListOptions.conditionId
            });
        }

        if (condition) {
            condition.setOptions(screenListOptions);
        } else {
            condition = new VoipScreenScreenList(angular.extend(screenListOptions, {
                featureType: "ovhPabx",
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                dialplanId: self.dialplanId,
                extensionId: self.extensionId
            }));
            self.screenListConditions.push(condition);
        }

        return condition;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.removeScreenListCondition = function (screenListCondition) {
        var self = this;

        _.remove(self.screenListConditions, screenListCondition);

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.saveScreenListConditions = function () {
        var self = this;
        var savePromises = [];

        self.screenListConditions.forEach(function (screenList) {
            if (screenList.state === "TO_DELETE") {
                savePromises.push(screenList.remove().then(function () {
                    return self.removeScreenListCondition(screenList);
                }));
            } else if (screenList.state === "DRAFT") {
                savePromises.push(screenList.create().catch(function (error) {
                    self.removeScreenListCondition(screenList);
                    return $q.reject(error);
                }));
            }
        });

        return $q.allSettled(savePromises);
    };

    /* ----------  TIMECONDITIONS  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.getTimeConditions = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionTime().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            dialplanId: self.dialplanId,
            extensionId: self.extensionId
        }).$promise.then(function (ruleIds) {
            return $q.all(_.map(_.chunk(ruleIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionTime().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    dialplanId: self.dialplanId,
                    extensionId: self.extensionId,
                    conditionId: chunkIds
                }).$promise.then(function (resources) {
                    _.chain(resources).filter(function (resource) {
                        return resource.value !== null;
                    }).map("value").sortBy("conditionId").value().forEach(function (timeConditionOptions) {
                        self.addTimeCondition(timeConditionOptions);
                    });
                });
            })).then(function () {
                return self;
            });
        });
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.addTimeCondition = function (timeConditionOptionsParam) {
        var self = this;
        var condition = null;
        var timeConditionOptions = timeConditionOptionsParam;

        if (!timeConditionOptions) {
            timeConditionOptions = {};
        }

        if (timeConditionOptions.conditionId) {
            condition = _.find(self.timeConditions, {
                conditionId: timeConditionOptions.conditionId
            });
        }

        if (condition) {
            condition.setOptions(timeConditionOptions);
        } else {
            condition = new VoipTimeConditionCondition(angular.extend(timeConditionOptions, {
                featureType: "ovhPabx",
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                dialplanId: self.dialplanId,
                extensionId: self.extensionId
            }));
            self.timeConditions.push(condition);
        }

        return condition;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.removeTimeCondition = function (timeCondition) {
        var self = this;

        _.remove(self.timeConditions, timeCondition);

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.saveTimeConditions = function () {
        var self = this;
        var savePromises = [];
        var toDeletePromises = [];

        self.timeConditions.forEach(function (timeCondition) {
            if (timeCondition.state === "TO_DELETE") {
                timeCondition.state = "DELETING";
                toDeletePromises.push(timeCondition.remove().then(function () {
                    return self.removeTimeCondition(timeCondition);
                }));
            } else if (timeCondition.state === "DRAFT") {
                timeCondition.state = "CREATING";
                savePromises.push(timeCondition.create().catch(function (error) {
                    self.removeTimeCondition(timeCondition);
                    return $q.reject(error);
                }));
            }
        });

        return $q.allSettled(toDeletePromises).then(function () {
            return $q.allSettled(savePromises);
        });
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = {
            screenListType: angular.copy(self.screenListType),
            schedulerCategory: angular.copy(self.schedulerCategory),
            screenListConditions: angular.copy(self.screenListConditions),
            timeConditions: angular.copy(self.timeConditions)
        };

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.screenListType = angular.copy(self.saveForEdition.screenListType);
            self.schedulerCategory = angular.copy(self.saveForEdition.schedulerCategory);
        }

        if (cancel) {
            // cancel screen list conditions
            // remove draft
            _.remove(self.screenListConditions, {
                state: "DRAFT"
            });

            // and reset status of conditions to delete
            self.screenListConditions.forEach(function (condition) {
                if (condition.state === "TO_DELETE") {
                    condition.state = "OK";
                }
            });

            // cancel time conditions
            // remove draft
            _.remove(self.timeConditions, {
                state: "DRAFT"
            });

            // and reset status of conditions to delete
            self.timeConditions.forEach(function (timeCondition) {
                if (timeCondition.state === "TO_DELETE") {
                    timeCondition.state = "OK";
                }
            });
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberOvhPabxDialplanExtension.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            switch (attr) {
            case "screenListConditions":
                // there is change in screen list conditions if one or more scondition is in creation (draft) or to delete state
                return _.some(self.screenListConditions, function (screenListCondition) {
                    return ["DRAFT", "TO_DELETE"].indexOf(screenListCondition.state) !== -1;
                });
            case "timeConditions":
                // there is change in screen time conditions if one or more scondition is in creation (draft) or to delete state
                return _.some(self.timeConditions, function (timeCondition) {
                    return ["DRAFT", "TO_DELETE"].indexOf(timeCondition.state) !== -1;
                });
            default:
                return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
            }
        } else {
            return self.hasChange("screenListType") || self.hasChange("schedulerCategory") || self.hasChange("screenListConditions") || self.hasChange("timeConditions");
        }
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberOvhPabxDialplanExtension;

});
