angular.module("managerApp").controller("TelecomTelephonyLineCallsTimeConditionCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast, uiCalendarConfig) {
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

});
