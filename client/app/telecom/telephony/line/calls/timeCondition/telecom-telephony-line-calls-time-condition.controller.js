angular.module("managerApp").controller("TelecomTelephonyLineCallsTimeConditionCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast, uiCalendarConfig, telephonyBulk) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.line = null;
    self.helpCollapsed = true;
    self.availableTimeoutValues = null;
    self.slotList = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChange = function () {
        var isConditionsInEdition = _.some(self.line.timeCondition.conditions, {
            inEdition: true
        });

        return !isConditionsInEdition && self.line.timeCondition.hasChange();
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onTimeConditionFormSubmit = function () {
        self.line.timeCondition.status = "SAVING";

        // first save options
        return self.line.timeCondition.save().then(function () {
            self.line.timeCondition.stopEdition().stopSlotsEdition(false, false, true).startEdition();

            // then save conditions
            return self.line.timeCondition.saveConditions().then(function () {
                Toast.success($translate.instant("telephony_line_calls_time_condition_save_success"));
            });
        }, function (error) {
            self.line.timeCondition.stopEdition(true).startEdition();
            Toast.error([$translate.instant("telephony_line_calls_time_condition_save_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.line.timeCondition.status = "OK";
        });
    };

    self.onTimeConditionFormReset = function () {
        // stop and restart the edition of time condition (stop also slots edition)
        self.line.timeCondition.stopEdition(true).stopSlotsEdition(true, true).stopConditionsEdition(true, true).startEdition();

        // refresh the calendar...
        uiCalendarConfig.calendars.conditionsCalendar.fullCalendar("refetchEvents");
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Enums  ----------*/

    function getTimeoutEnum () {
        return TelephonyMediator.getApiModelEnum("telephony.TimeConditionsTimeoutEnum").then(function (values) {
            self.availableTimeoutValues = _.chain(values).map(function (valueParam) {
                var value = parseInt(valueParam, 10);
                return {
                    value: value,
                    label: $translate.instant("telephony_line_calls_time_condition_params_timeout_choice", {
                        value: value
                    })
                };
            }).sortBy("value").value();
        });
    }

    /* ----------  Controller initialization  ----------*/

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);

            return $q.all([
                self.line.getTimeCondition(),
                getTimeoutEnum()
            ]).then(function () {
                self.line.timeCondition.startEdition();
                self.slotList = _.chunk(self.line.timeCondition.slots, 2);
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_calls_time_condition_load_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        conditions: self.line && self.line.timeCondition || [],
        infos: {
            name: "timeCondition",
            actions: [
                {
                    name: "deleteSrcConditions",
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition/{id}",
                    method: "DELETE",
                    params: null
                },
                {
                    name: "editSrcConditions",
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition/{id}",
                    method: "PUT",
                    params: null
                },
                {
                    name: "options",
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/options",
                    method: "PUT",
                    params: null
                }
            ]
        }
    };

    self.getBulkParams = function (action) {
        switch (action) {
        case "deleteSrcConditions":
        case "editSrcConditions":
            return false;
        case "options":
            var condition = self.line.timeCondition;
            return {
                slot1Number: condition.slots[1].number,
                slot1Type: condition.slots[1].type,
                slot2Number: condition.slots[2].number,
                slot2Type: condition.slots[2].type,
                slot3Number: condition.slots[3].number,
                slot3Type: condition.slots[3].type,
                status: condition.enable ? "enabled" : "disabled",
                timeout: condition.timeout,
                unavailableNumber: condition.slots[4].number,
                unavailableType: condition.slots[4].type
            };
        default:
            return false;
        }
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_calls_time_condition_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_calls_time_condition_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_calls_time_condition_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_calls_time_condition_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    self.getTimeConditions = function () {
        self.bulkActions = [];
        self.timeConditions = [];
        _.map(self.line.timeCondition.conditions, function (item) {
            var id = item.conditionId,
                timeCondition = {
                    day: item.weekDay,
                    hourBegin: item.timeFrom,
                    hourEnd: item.timeTo,
                    policy: item.policy,
                    status: item.status
                };
            self.timeConditions.push(timeCondition);
            self.bulkActions.push({
                name: "deleteTC" + id,
                route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition/" + id,
                method: "DELETE",
                params: null
            });
        });
        _.map(self.timeConditions, function (item, key) {
            self.bulkActions.push({
                name: "addTC" + key,
                route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition",
                method: "POST",
                params: null
            });
        });
        self.bulkActions.push();
        self.bulkDatas.infos.actions = self.bulkActions;
    };

});
