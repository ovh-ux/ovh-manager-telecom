angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationTimeConditionEasyHuntingCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast, uiCalendarConfig) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.number = null;
    self.helpCollapsed = true;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChange = function () {
        var isConditionsInEdition = _.some(self.number.feature.timeCondition.conditions, {
            inEdition: true
        });

        return !isConditionsInEdition && self.number.feature.timeCondition.hasChange();
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onTimeConditionFormSubmit = function () {
        self.number.feature.timeCondition.status = "SAVING";

        // first save options
        return self.number.feature.timeCondition.save().then(function () {
            self.number.feature.timeCondition.stopEdition().stopSlotsEdition(false, false, true).startEdition();

            // then save conditions
            return self.number.feature.timeCondition.saveConditions().then(function () {
                Toast.success($translate.instant("telephony_alias_configuration_time_condition_save_success"));
            });
        }, function (error) {
            self.number.feature.timeCondition.stopEdition(true).startEdition();
            Toast.error([$translate.instant("telephony_line_calls_time_condition_save_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.number.feature.timeCondition.status = "OK";
        });
    };

    self.onTimeConditionFormReset = function () {
        // stop and restart the edition of time condition (stop also slots edition)
        self.number.feature.timeCondition.stopEdition(true).stopSlotsEdition(true, true).stopConditionsEdition(true, true).startEdition();

        // refresh the calendar...
        uiCalendarConfig.calendars.conditionsCalendar.fullCalendar("refetchEvents");
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                return self.number.feature.getTimeCondition().then(function () {
                    // start timeCondition edition
                    self.number.feature.timeCondition.startEdition();
                });
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_time_condition_load_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
