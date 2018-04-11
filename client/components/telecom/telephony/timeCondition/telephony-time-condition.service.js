angular.module("managerApp").service("voipTimeCondition", function ($q, $translate, OvhApiTelephony, VOIP_TIME_CONDITION, VOIP_TIMECONDITION_ORDERED_DAYS) {
    "use strict";

    var self = this;

    var timeConditionResources = {
        sip: {
            init: OvhApiTelephony.TimeCondition().v6().getOptions,
            save: OvhApiTelephony.TimeCondition().v6().setOptions,
            condition: OvhApiTelephony.TimeCondition().Condition().v6()
        },
        easyHunting: {
            init: OvhApiTelephony.EasyHunting().TimeConditions().v6().get,
            save: OvhApiTelephony.EasyHunting().TimeConditions().v6().save,
            condition: OvhApiTelephony.EasyHunting().TimeConditions().Conditions().v6()
        },
        ovhPabx: {
            condition: OvhApiTelephony.OvhPabx().Dialplan().Extension().ConditionTime().v6()
        }
    };

    /*= ====================================================
    =            HELPERS FOR PARSING SIP HOURS            =
    =====================================================*/

    self.getSipTime = function (time, isEnd) {
        var splittedTime = time.split(":");
        var hours = _.get(splittedTime, "[0]");
        var minutes = _.get(splittedTime, "[1]");
        if (isEnd) {
            var hoursInt = parseInt(hours, 10);
            var minutesInt = parseInt(minutes, 10);
            if (minutesInt === 59) {
                hours = _.padLeft(hoursInt + 1, 2, "0");
                minutes = "00";
            } else {
                minutes = _.padLeft(minutesInt + 1, 2, "0");
            }
        }

        return [hours, minutes].join("");
    };

    self.parseSipTime = function (timeStr, modulo) {
        var hour = timeStr.substring(0, 2);
        var minute = timeStr.substring(2);
        var second = modulo ? "59" : "00";

        if (modulo) {
            var minuteInt = parseInt(minute, 10);
            if (minuteInt === 0) {
                hour = _.padLeft(hour - 1, 2, "0");
                minute = "59";
                second = "59";
            } else if (minuteInt % 15 === 0) {
                minute = _.padLeft(minuteInt - 1, 2, "0");
                second = "59";
            }
        }

        return [hour, minute, second].join(":");
    };

    self.parseTime = function (timeStr) {
        var splittedTimeStr = timeStr.split(":");
        var hour = splittedTimeStr[0];
        var minute = splittedTimeStr[1];
        var second = splittedTimeStr[2];
        var minuteInt = parseInt(minute, 10);
        if (minuteInt % 15 === 0) {
            var timeMoment = moment().hour(hour).minute(minute).second(second);
            return timeMoment.startOf("minute").subtract(1, "second").format("HH:mm:ss");
        }
        return timeStr;

    };

    /* -----  End of HELPERS FOR PARSING SIP HOURS  ------*/

    self.getAvailableSlotsCount = function (featureType) {
        return _.get(VOIP_TIME_CONDITION, "slotTypesCount." + featureType, 0);
    };

    self.getResource = function (resourceType, featureType) {
        return _.get(timeConditionResources, featureType + "." + resourceType, {
            $promise: $q.when({})
        });
    };

    self.getResourceCallParams = function (timeCondition) {
        var params = {
            billingAccount: timeCondition.billingAccount,
            serviceName: timeCondition.serviceName
        };

        if (timeCondition.featureType === "ovhPabx") {
            params.dialplanId = timeCondition.dialplanId;
            params.extensionId = timeCondition.extensionId;
        }

        return params;
    };

    self.getConditionResourceCallParams = function (conditionObject, conditionId) {
        var params = self.getResourceCallParams(conditionObject);

        if (conditionId !== null) {
            _.set(params, conditionObject.featureType === "sip" ? "id" : "conditionId", conditionObject.conditionId || conditionId);
        }

        return params;
    };

    self.getResourceCallActionParams = function (timeCondition) {
        var actionParams = {};

        if (timeCondition.featureType === "ovhPabx") {
            return {};
        }

        // set slot values
        _.filter(timeCondition.slots, function (slot) {
            return slot.name !== "available" && !_.isEmpty(slot.number);
        }).forEach(function (slot) {
            _.set(actionParams, slot.name + "Type", slot.type);
            _.set(actionParams, slot.name + "Number", slot.number);
        });

        if (timeCondition.featureType === "sip") {
            _.set(actionParams, "status", timeCondition.enable ? "enabled" : "disabled");
            _.set(actionParams, "timeout", timeCondition.timeout);

        } else {
            _.set(actionParams, "enable", timeCondition.enable);
        }

        return actionParams;
    };

    self.getConditionResourceCallActionParams = function (condition) {
        var actionParams = {};

        // set timeFrom => hourEnd for sip
        _.set(actionParams, condition.featureType === "sip" ? "hourBegin" : "timeFrom", condition.featureType === "sip" ? self.getSipTime(condition.timeFrom) : condition.timeFrom);

        // set timeTo => hourBegin for sip
        _.set(actionParams, condition.featureType === "sip" ? "hourEnd" : "timeTo", condition.featureType === "sip" ? self.getSipTime(condition.timeTo, true) : condition.timeTo);

        // set weekDay => day for sip
        _.set(actionParams, condition.featureType === "sip" ? "day" : "weekDay", condition.weekDay);

        // set policy if not ovhPabx
        if (condition.featureType !== "ovhPabx") {
            _.set(actionParams, "policy", condition.policy);
        }

        return actionParams;
    };

    /*= ===========================================
    =            GROUP TIMECONDITIONS            =
    ============================================*/

    self.createGroupCondition = function (days, groupedConditionSlots) {
        return {
            days: days,
            slots: !groupedConditionSlots || _.isEmpty(groupedConditionSlots) ? [] : Object.keys(groupedConditionSlots).map(function (slotKey) {
                var slotConditions = groupedConditionSlots[slotKey];
                return {
                    condition: slotConditions[0].clone(),
                    conditions: slotConditions
                };
            }),
            getDisplayedText: function () {
                var followingIndex = false;
                var groupText;

                // get ordered days indexes
                var daysIndex = _.map(this.days, function (day) {
                    return VOIP_TIMECONDITION_ORDERED_DAYS.indexOf(day);
                }).sort();

                // check if indexes follow each others
                if (daysIndex.length > 1) {
                    followingIndex = _.every(daysIndex, function (dayIndex, arrayIndex) {
                        if (arrayIndex === 0) {
                            return true;
                        }
                        return dayIndex === daysIndex[arrayIndex - 1] + 1;

                    });
                }

                // build text to display
                // first build day display
                if (followingIndex) {
                    // first day
                    var firstDayIndex = _.first(daysIndex);
                    var firstDay = moment().weekday(firstDayIndex).format("dd");

                    // last day
                    var lastDayIndex = _.last(daysIndex);
                    var lastDay = moment().weekday(lastDayIndex).format("dd");
                    groupText = [firstDay, lastDay].join(" - ");
                } else {
                    groupText = _.map(daysIndex, function (dayIndex) {
                        return moment().weekday(dayIndex).format("dd");
                    }).join(", ");
                }

                // then build hours slots
                groupText += " : ";
                var sortedSlots = _.chain(this.slots).filter(function (slot) {
                    return slot.condition;
                }).sortByOrder(function (slot) {
                    return slot.condition.getTimeMoment().toDate();
                }).value();
                groupText += _.map(sortedSlots, function (slot) {
                    return [
                        $translate.instant("telephony_common_time_condition_slot_from"),
                        slot.condition.getTimeMoment("from").format("HH:mm"),
                        $translate.instant("telephony_common_time_condition_slot_to"),
                        slot.condition.getTimeMoment("to").add(1, "second").format("HH:mm")
                    ].join(" ");
                }).join(", ");

                return groupText;
            }
        };
    };

    function groupConditionsByTimes (conditions) {
        var tmpCdts = {};

        conditions.forEach(function (timeCondition) {
            var group = JSON.stringify([timeCondition.timeFrom, timeCondition.timeTo]);
            tmpCdts[group] = tmpCdts[group] || [];
            tmpCdts[group].push(timeCondition);
        });

        return Object.keys(tmpCdts).map(function (group) {
            return tmpCdts[group];
        });
    }

    /**
     *  Group same conditions per days. No check at policy for the moment
     */
    self.groupTimeConditions = function (conditions) {
        var tmpGroups = {};

        // first group conditions by time from and time to
        var groupedConditions = groupConditionsByTimes(conditions);

        // then group the grouped conditions with the same day
        groupedConditions.forEach(function (group) {
            var groupKey = JSON.stringify(_.map(group, "weekDay").sort());
            tmpGroups[groupKey] = tmpGroups[groupKey] || [];
            tmpGroups[groupKey] = tmpGroups[groupKey].concat(group);
        });

        // finally regroup the grouped conditions by time from and time to
        return Object.keys(tmpGroups).map(function (groupKey) {
            var tmpGroup = tmpGroups[groupKey];

            // create the final groups - a group contains : the days and the hours slots
            return self.createGroupCondition(_.chain(tmpGroup).map("weekDay").uniq().value(), groupConditionsByTimes(tmpGroup));
        });
    };

    /* -----  End of GROUP TIMECONDITIONS  ------*/

});
