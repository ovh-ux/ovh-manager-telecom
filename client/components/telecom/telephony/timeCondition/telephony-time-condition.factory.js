angular.module("managerApp").factory("VoipTimeCondition", function ($q, voipTimeCondition, VoipTimeConditionCondition, VoipTimeConditionSlot) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function VoipTimeCondition (options) {
        var opts = options || {};

        // options check
        if (!opts.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new VoipTimeCondition");
        }
        if (!opts.serviceName) {
            throw new Error("serviceName option must be specified when creating a new VoipTimeCondition");
        }
        if (!opts.featureType) {
            throw new Error("featureType option must be specified when creating a new VoipTimeCondition");
        }

        // mandatory
        this.billingAccount = opts.billingAccount;
        this.serviceName = opts.serviceName;
        this.featureType = opts.featureType;

        // check for mandatory field required by ovhPabx feature type
        if (this.featureType === "ovhPabx") {
            if (!opts.extensionId) {
                throw new Error("extensionId option must be specified when creating a new VoipTimeCondition");
            }

            this.extensionId = opts.extensionId;
        }

        // from api
        this.slots = [];
        this.setOptions(opts);

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.status = "OK";
        this.conditions = [];
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    VoipTimeCondition.prototype.setOptions = function (options) {
        var self = this;
        var tmpSlotNumber;
        var tmpSlotName;
        var tmpSlot;
        var opts = options || {};

        if (self.featureType === "ovhPabx") {
            // no options for ovhPabx
            return self;
        }

        // set available slot
        var availableSlot = _.find(self.slots, {
            name: "available"
        });

        if (availableSlot) {
            availableSlot.setOptions({
                number: self.serviceName
            });
        } else {
            self.slots.push(new VoipTimeConditionSlot({
                name: "available",
                serviceName: self.serviceName,
                number: self.serviceName
            }));
        }

        // set slot types
        for (var i = 0; i < voipTimeCondition.getAvailableSlotsCount(self.featureType); i++) {
            tmpSlotNumber = i + 1;
            tmpSlotName = "slot" + tmpSlotNumber;
            tmpSlot = _.find(self.slots, {
                name: tmpSlotName
            });

            if (tmpSlot) {
                tmpSlot.setOptions({
                    type: _.get(opts, tmpSlotName + "Type") || "number",
                    number: _.get(opts, tmpSlotName + "Number") || ""
                });
            } else {
                self.slots.push(new VoipTimeConditionSlot({
                    serviceName: self.serviceName,
                    name: tmpSlotName,
                    type: _.get(opts, tmpSlotName + "Type") || "number",
                    number: _.get(opts, tmpSlotName + "Number") || ""
                }));
            }
        }

        // set unavailable slot
        var unavailableSlot = _.find(self.slots, {
            name: "unavailable"
        });

        if (unavailableSlot) {
            unavailableSlot.setOptions({
                type: opts.unavailableType || "number",
                number: opts.unavailableNumber || ""
            });
        } else {
            self.slots.push(new VoipTimeConditionSlot({
                name: "unavailable",
                serviceName: self.serviceName,
                type: opts.unavailableType || "number",
                number: opts.unavailableNumber || ""
            }));
        }

        // set timeout option for sip feature type and enable state
        if (self.featureType === "sip") {
            self.timeout = opts.timeout || 45;
            self.enable = opts.status === "enabled";
        } else {
            self.enable = opts.enable || false;
        }

        return self;
    };

    /* ----------  API Calls  ----------*/

    VoipTimeCondition.prototype.init = function () {
        var self = this;
        var getResource = voipTimeCondition.getResource("init", self.featureType);

        return getResource(voipTimeCondition.getResourceCallParams(self)).$promise.then(function (options) {
            return self.setOptions(options);
        });
    };

    VoipTimeCondition.prototype.save = function () {
        var self = this;
        var saveResource = voipTimeCondition.getResource("save", self.featureType);

        return saveResource(voipTimeCondition.getResourceCallParams(self), voipTimeCondition.getResourceCallActionParams(self)).$promise;
    };

    VoipTimeCondition.prototype.saveConditions = function () {
        var self = this;
        var savePromises = [];
        var actionPromise;

        _.filter(self.conditions, function (condition) {
            return condition.hasChange(null, true);
        }).forEach(function (condition) {
            if (condition.state === "TO_CREATE") {
                actionPromise = condition.create().then(function () {
                    condition.stopEdition(false, false, true);
                });
                savePromises.push(actionPromise);
            } else if (condition.state === "TO_DELETE") {
                actionPromise = condition.remove().then(function () {
                    self.removeCondition(condition);
                });
                savePromises.push(actionPromise);
            } else if (condition.state === "OK") {
                actionPromise = condition.save().then(function () {
                    condition.stopEdition(false, false, true);
                });
                savePromises.push(actionPromise);
            }
        });

        return $q.allSettled(savePromises);
    };

    /* ----------  CONDITIONS  ----------*/

    VoipTimeCondition.prototype.getConditions = function () {
        var self = this;
        var conditionResources = voipTimeCondition.getResource("condition", self.featureType);

        return conditionResources.query(voipTimeCondition.getResourceCallParams(self)).$promise.then(function (conditionIds) {
            return $q.all(_.map(_.chunk(conditionIds, 50), function (chunkIds) {
                return conditionResources.getBatch(voipTimeCondition.getConditionResourceCallParams(self, chunkIds)).$promise.then(function (resources) {
                    angular.forEach(_.map(resources, "value"), function (conditionOptions) {
                        self.addCondition(conditionOptions);
                    });
                });
            })).then(function () {
                return self;
            });
        });
    };

    VoipTimeCondition.prototype.addCondition = function (conditionOptions) {
        var self = this;
        var condition = null;
        var opts = conditionOptions || {};

        if (opts.conditionId) {
            condition = _.find(self.conditions, {
                conditionId: opts.conditionId
            });
        } else if (opts.id) {
            condition = _.find(self.conditions, {
                conditionId: opts.id
            });
        }

        if (condition) {
            condition.setOptions(opts);
        } else {
            condition = new VoipTimeConditionCondition(angular.extend(opts, voipTimeCondition.getResourceCallParams(self), {
                featureType: self.featureType
            }));
            self.conditions.push(condition);
        }

        return condition;
    };

    VoipTimeCondition.prototype.removeCondition = function (condition) {
        var self = this;

        _.remove(self.conditions, condition);

        return self;
    };

    VoipTimeCondition.prototype.getCondition = function (conditionId) {
        var self = this;

        return _.find(self.conditions, {
            conditionId: conditionId
        });
    };

    /* ----------  EDITION  ----------*/

    VoipTimeCondition.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {};

        if (self.featureType === "ovhPabx") {
            return self;
        }

        // save enable state
        _.set(self.saveForEdition, "enable", angular.copy(self.enable));

        // save timeout if sip feature type
        if (self.featureType === "sip") {
            _.set(self.saveForEdition, "timeout", angular.copy(self.timeout));
        }

        return self;
    };

    VoipTimeCondition.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.featureType !== "ovhPabx" && self.saveForEdition && cancel) {
            // reset enable state
            self.enable = angular.copy(self.saveForEdition.enable);

            // reset timeout if sip feature type
            if (self.featureType === "sip") {
                self.timeout = angular.copy(self.saveForEdition.timeout);
            }
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    VoipTimeCondition.prototype.stopSlotsEdition = function (cancel, cancelOriginalSave, resetOriginalSave) {
        var self = this;

        angular.forEach(self.slots, function (slot) {
            slot.stopEdition(cancel, cancelOriginalSave, resetOriginalSave);
        });

        return self;
    };

    VoipTimeCondition.prototype.stopConditionsEdition = function (cancel, cancelOriginalSave, resetOriginalSave) {
        var self = this;

        angular.forEach(self.conditions, function (condition) {
            if (condition.state === "TO_CREATE" || condition.state === "DRAFT") {
                self.removeCondition(condition);
            } else {
                if (condition.state === "TO_DELETE") {
                    condition.state = "OK";
                }
                condition.stopEdition(cancel, cancelOriginalSave, resetOriginalSave);
            }
        });

        return self;
    };

    VoipTimeCondition.prototype.hasChange = function (property) {
        var self = this;

        if (!self.saveForEdition) {
            return false;
        }

        if (property) {
            switch (property) {
            case "slots":
                return _.some(self.slots, function (slot) {
                    return !slot.inEdition && slot.hasChange(null, true);
                });
            case "conditions":
                return _.some(self.conditions, function (condition) {
                    return condition.hasChange(null, true);
                });
            default:
                return !_.isEqual(_.get(self, property), _.get(self.saveForEdition, property));
            }
        } else {
            switch (self.featureType) {
            case "sip":
                return self.hasChange("enable") || self.hasChange("timeout") || self.hasChange("slots") || self.hasChange("conditions");
            case "easyHunting":
                return self.hasChange("enable") || self.hasChange("slots") || self.hasChange("conditions");
            default:
                return false;
            }

        }
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return VoipTimeCondition;

});
