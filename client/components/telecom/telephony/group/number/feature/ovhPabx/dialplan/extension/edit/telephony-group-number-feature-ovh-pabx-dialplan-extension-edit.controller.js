angular.module("managerApp").controller("telephonyNumberOvhPabxDialplanExtensionEditCtrl", function ($scope, $q, telephonyScheduler, voipTimeCondition, VOIP_TIMECONDITION_ORDERED_DAYS) {
    "use strict";

    var self = this;
    var orderedDays = _.map(VOIP_TIMECONDITION_ORDERED_DAYS, function (day, index) {
        return {
            value: day,
            label: moment().set("day", index + 1).format("dd")
        };
    });

    self.loading = {
        init: false
    };

    self.model = {
        callerIdNumber: null,
        hour: null
    };

    self.parentCtrl = null;
    self.dialplan = null;
    self.extension = null;

    self.groupedTimeConditions = null;
    self.availableHours = null;

    self.schedulerCategories = null;
    self.screenListTypes = ["incomingBlackList", "incomingWhiteList"];

    self.conditionMatched = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getDayQuarter () {
        var start = moment().startOf("day");
        var end = moment().endOf("day");
        var quarters = [];

        while (start.isBefore(end)) {
            quarters.push(start.format("HH:mm"));
            start.add(15, "minutes");
        }

        return quarters;
    }

    function transformVoipTimeConditionGroup (group) {
        // set day model
        group.dayModel = _.map(angular.copy(orderedDays), function (day) {
            day.selected = group.days.indexOf(day.value) !== -1;
            return day;
        });

        // set new slot time models
        group.slotTimeModel = {
            timeFrom: null,
            timeTo: null
        };

        // set errors object
        group.errors = {
            timeFrom: false,
            timeTo: false,
            collision: false,
            badSlot: false
        };

        // set collapsed state
        group.collapsed = true;
        return group;
    }

    self.convertCategoryToSlot = function (category) {
        return telephonyScheduler.convertCategoryToSlot(null, category);
    };

    self.getScreenListConditionList = function () {
        return _.filter(self.extension.screenListConditions, function (screenList) {
            return screenList.state !== "TO_DELETE";
        });
    };

    self.isConditionMatch = function (phoneNumber) {
        self.conditionMatched = _.find(self.getScreenListConditionList(), function (condition) {
            return _.startsWith(phoneNumber, condition.callNumber);
        });

        return !self.conditionMatched;
    };

    self.orderConditionTimeByTimeFrom = function (slot) {
        return slot.condition.getTimeMoment().toDate();
    };

    /* ----------  TIME CONDITIONS  ----------*/

    self.hourStartWith = function (curHour, viewValue) {
        return _.startsWith(curHour.toString(), viewValue.toString()) || _.startsWith(curHour.toString(), "0" + viewValue.toString());
    };

    self.isConditionGroupValid = function (conditionGroup) {
        return conditionGroup.days.length && self.availableHours.indexOf(conditionGroup.slotTimeModel.timeFrom) !== -1 && self.availableHours.indexOf(conditionGroup.slotTimeModel.timeTo) !== -1;
    };

    self.getTimeConditionList = function () {
        return _.filter(self.extension.timeConditions, function (timeCondition) {
            return timeCondition.state !== "TO_DELETE";
        });
    };

    function manageTimeConditionRemove (timeConditions) {
        timeConditions.forEach(function (timeCondition) {
            if (timeCondition.state === "DRAFT") {
                self.extension.removeTimeCondition(timeCondition);
            } else {
                timeCondition.state = "TO_DELETE";
            }
        });
    }

    function hasConditionCollision (timeConditions, timeFromParam, timeToParam) {
        var timeFrom = timeFromParam;
        var timeTo = timeToParam;
        return _.some(timeConditions, function (timeCondition) {
            var momentFrom = timeCondition.getTimeMoment("from");
            if (!moment.isMoment(timeFrom)) {
                var splittedModelFrom = timeFrom.split(":");
                timeFrom = moment(momentFrom).hour(splittedModelFrom[0]).minute(splittedModelFrom[1]);
            }
            var momentTo = timeCondition.getTimeMoment("to");
            if (!moment.isMoment(timeTo)) {
                var splittedModelTo = timeTo.split(":");
                timeTo = moment(momentTo).hour(splittedModelTo[0]).minute(splittedModelTo[1]);
            }
            return timeFrom.isBetween(momentFrom, momentTo, null, "[]") || timeTo.isBetween(momentFrom, momentTo, null, "[]") || momentFrom.isBetween(timeFrom, timeTo, null, "[]") || momentTo.isBetween(timeFrom, timeTo, null, "[]");
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    /* ----------  CONDITION TYPE  ----------*/

    self.onConditionTypeBtnClick = function (conditionType) {
        self.parentCtrl.popoverStatus.move = true;
        self.parentCtrl.popoverStatus.rightPage = conditionType;
    };

    /* ----------  TIME CONDITION  ----------*/

    self.onConditionGroupAddBtnClick = function () {
        var conditionGroup = transformVoipTimeConditionGroup(voipTimeCondition.createGroupCondition([], {}));
        conditionGroup.collapsed = false;
        self.groupedTimeConditions.push(conditionGroup);
    };

    self.onDayBtnClick = function (day, conditionGroup) {
        var dayConditions = [];
        conditionGroup.errors.collision = false;

        if (day.selected) {
            if (conditionGroup.days.indexOf(day.value) > -1) {
                return false;
            }

            // before check if there is no collision
            var filteredConditions = _.filter(self.extension.timeConditions, function (timeCondition) {
                return timeCondition.state !== "TO_DELETE" && day.value === timeCondition.weekDay;
            });
            var isCollisionDetected = _.some(conditionGroup.slots, function (slot) {
                return hasConditionCollision(filteredConditions, slot.condition.timeFrom, slot.condition.timeTo);
            });

            if (isCollisionDetected) {
                conditionGroup.errors.collision = true;
                day.selected = false;
                return false;
            }

            // add day to group list
            conditionGroup.days.push(day.value);

            // add day conditions to group slots
            // if conditions exists - change their state
            conditionGroup.slots.forEach(function (slot) {
                dayConditions = dayConditions.concat(_.filter(slot.conditions, {
                    weekDay: day.value
                }));
            });

            if (dayConditions.length) {
                // set states to 'OK'
                dayConditions.forEach(function (timeCondition) {
                    timeCondition.state = "OK";
                });
            } else {
                conditionGroup.slots.forEach(function (slot) {
                    var newConditionOptions = angular.copy(slot.condition);
                    newConditionOptions.state = "DRAFT";
                    newConditionOptions.weekDay = day.value;
                    delete newConditionOptions.conditionId;
                    slot.conditions.push(self.extension.addTimeCondition(newConditionOptions));
                });
            }
        } else {
            // remove day from group list
            _.remove(conditionGroup.days, function (curDay) {
                return curDay === day.value;
            });

            // remove conditions from slots
            // get conditions of given day
            conditionGroup.slots.forEach(function (slot) {
                dayConditions = dayConditions.concat(_.filter(slot.conditions, {
                    weekDay: day.value
                }));
            });

            // manage condition states
            manageTimeConditionRemove(dayConditions);

            if (!conditionGroup.days.length) {
                conditionGroup.slots = [];
            }
        }

        return null;
    };

    self.onConditionAddBtnClick = function (conditionsGroup) {
        conditionsGroup.errors.badSlot = false;
        conditionsGroup.errors.collision = false;

        // check if slot end is bigger than begin
        var curDate = moment().format("YYYY-MM-DD");
        var endHourMoment = conditionsGroup.slotTimeModel.timeTo === "00:00" ? moment().endOf("day") : moment(curDate + " " + conditionsGroup.slotTimeModel.timeTo);
        if (!moment(curDate + " " + conditionsGroup.slotTimeModel.timeFrom).isBefore(endHourMoment)) {
            conditionsGroup.errors.badSlot = true;
            return false;
        }

        // check for collision
        var isCollisionDetected = _.some(conditionsGroup.days, function (day) {
            // check if a condition overlap an other condition on the same day
            var filteredConditions = _.filter(self.extension.timeConditions, function (timeCondition) {
                return timeCondition.state !== "TO_DELETE" && day === timeCondition.weekDay;
            });

            return hasConditionCollision(filteredConditions, conditionsGroup.slotTimeModel.timeFrom, conditionsGroup.slotTimeModel.timeTo);
        });

        if (isCollisionDetected) {
            conditionsGroup.errors.collision = true;
            return false;
        }

        var slotConditions = [];

        // create time conditions object
        conditionsGroup.days.forEach(function (day) {
            var condition = self.extension.addTimeCondition({
                state: "DRAFT",
                timeFrom: conditionsGroup.slotTimeModel.timeFrom + ":00",
                timeTo: conditionsGroup.slotTimeModel.timeTo + ":00",
                weekDay: day
            });

            slotConditions.push(condition);
        });

        // add a new slot to group
        conditionsGroup.slots.push({
            condition: slotConditions[0].clone(),
            conditions: slotConditions
        });

        // reset time models
        conditionsGroup.slotTimeModel.timeFrom = null;
        conditionsGroup.slotTimeModel.timeTo = null;

        return null;
    };

    self.onTimeConditionDeleteConfirmBtnClick = function (slot, conditionsGroup) {
        // first set slot conditions state to "to delete" or remove from extension time conditions list
        manageTimeConditionRemove(slot.conditions);

        // then remove slot
        _.remove(conditionsGroup.slots, slot);
    };

    /* ----------  SCREENLIST  ----------*/

    self.onScreenListConditionAddBtnClick = function () {
        // add the condition
        self.extension.addScreenListCondition({
            callerIdNumber: self.model.callerIdNumber,
            screenListType: self.extension.screenListType,
            state: "DRAFT"
        });

        // reset model
        self.model.callerIdNumber = null;
    };

    self.onCallerIdNumberAddKeyDown = function ($event) {
        if ($event.key === "Enter" && self.addScreenListConditionForm.callerIdNumber.$valid) {
            self.onScreenListConditionAddBtnClick();
            $event.preventDefault();
            return false;
        }
        return null;
    };

    self.onScreenListDeleteConfirmBtnClick = function (condition) {
        if (condition.state === "DRAFT") {
            // if draft simply remove from list
            return self.extension.removeScreenListCondition(condition);
        }

        condition.state = "TO_DELETE";
        return null;
    };

    /* ----------  FOOTER ACTIONS  ----------*/

    self.onValidateBtnClick = function () {
        self.parentCtrl.popoverStatus.isOpen = false;

        // remove all screen list conditions if no list type selected
        if (_.isNull(self.extension.screenListType)) {
            self.extension.screenListConditions.forEach(function (condition) {
                if (condition.state !== "DRAFT") {
                    condition.state = "TO_DELETE";
                } else {
                    self.extension.removeScreenListCondition(condition);
                }
            });
        }

        return self.extension.save().then(function () {
            self.extension.stopEdition();
            return $q.allSettled([
                self.extension.saveScreenListConditions(),
                self.extension.saveTimeConditions()
            ]);
        }).finally(function () {
            self.parentCtrl.numberCtrl.jsplumbInstance.customRepaint();
        });
    };

    self.onCancelBtnClick = function () {
        self.parentCtrl.popoverStatus.isOpen = false;

        self.extension.stopEdition(true);
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.loading.init = true;

        // set parent ctrl
        self.parentCtrl = _.get($scope, "$parent.$ctrl");

        // set dialplan and extension
        self.dialplan = self.parentCtrl.dialplan;
        self.extension = self.parentCtrl.extension.startEdition();

        // set options for time conditions
        self.groupedTimeConditions = _.map(voipTimeCondition.groupTimeConditions(self.extension.timeConditions), transformVoipTimeConditionGroup);
        self.availableHours = getDayQuarter();

        return telephonyScheduler.getAvailableCategories().then(function (availableCategories) {
            self.schedulerCategories = availableCategories;
        }).finally(function () {
            self.loading.init = false;
        });
    };

    self.$onDestroy = function () {
        if (self.extension && !self.parentCtrl.isLoading()) {
            self.extension.stopEdition(true);
        }
    };

    /* -----  End of INITIALIZATION  ------*/

});
