angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationTimeConditionOldPabxCtrl", function ($q, $stateParams, $translate, $uibModal,
                                                                                                                OvhApiTelephony, TelephonyMediator, Toast, uiCalendarConfig, telephonyBulk,
                                                                                                                voipTimeCondition, VoipTimeConditionCondition, voipTimeConditionConfiguration) {
    "use strict";

    var self = this;
    var bulkActionNames = {
        createCondition: "createSrcCondition",
        deleteCondition: "deleteSrcCondition",
        editCondition: "editSrcCondition",
        options: "options"
    };

    self.loading = {
        init: false
    };

    self.number = null;
    self.helpCollapsed = true;
    self.availableTimeoutValues = null;

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
            Toast.error([$translate.instant("telephony_alias_configuration_time_condition_save_error"), _.get(error, "data.message")].join(" "));
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

    /* ----------  Enums  ----------*/

    function getTimeoutEnum () {
        return TelephonyMediator.getApiModelEnum("telephony.TimeConditionsTimeoutEnum").then(function (values) {
            self.availableTimeoutValues = _.chain(values).map(function (valueParam) {
                var value = parseInt(valueParam, 10);
                return {
                    value: value,
                    label: $translate.instant("telephony_time_condition_old_pabx_params_timeout_choice", {
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
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                return $q.all([
                    self.number.feature.getTimeCondition(),
                    getTimeoutEnum()
                ]).then(function () {
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

    /* ======================================
    =      EXPORT/IMPORT CONFIGURATION      =
    ======================================= */

    self.exportConfiguration = function () {
        if (self.number.feature.timeCondition.conditions) {
            voipTimeConditionConfiguration.exportConfiguration(self.number.feature.timeCondition.conditions);
        }
    };

    self.importConfiguration = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/service/time-condition/import/telecom-telephony-service-time-condition-import.html",
            controller: "TelecomTelephonyServiceTimeConditionImportCtrl",
            controllerAs: "TimeConditionImportCtrl"
        });

        modal.result.then(function (conditions) {
            // Set existing condition state to delete
            _.forEach(self.number.feature.timeCondition.conditions, function (condition) {
                condition.state = "TO_DELETE";
            });

            return self.number.feature.timeCondition.saveConditions().then(function () {
                self.number.feature.timeCondition.conditions = self.number.feature.timeCondition.conditions.concat(_.map(conditions, function (condition) {
                    condition.billingAccount = $stateParams.billingAccount;
                    condition.serviceName = $stateParams.serviceName;
                    condition.state = "TO_CREATE";
                    condition.featureType = "easyHunting";

                    condition.day = condition.weekDay;
                    condition.hourBegin = condition.timeFrom.split(":").slice(0, 2).join("");
                    condition.hourEnd = condition.timeTo.split(":").slice(0, 2).join("");

                    condition.featureType = "sip";

                    return new VoipTimeConditionCondition(condition);
                }));

                uiCalendarConfig.calendars.conditionsCalendar.fullCalendar("refetchEvents");
                return self.number.feature.timeCondition.saveConditions().then(function () {
                    Toast.success($translate.instant("telephony_common_time_condition_import_configuration_success"));
                }).catch(function () {
                    Toast.error($translate.instant("telephony_common_time_condition_import_configuration_error"));
                }).finally(function () {
                    self.$onInit();
                });
            });
        }).catch(function (error) {
            if (error) {
                Toast.error($translate.instant("telephony_common_time_condition_import_configuration_error"));
            }
        });
    };

    /* ------ End of EXPORT/IMPORT CONFIGURATION ------ */

    /* ===========================
    =            BULK            =
    ============================ */

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["easyPabx", "miniPabx"].indexOf(service.featureType) > -1;
        });
    };

    self.bulkDatas = {
        conditions: (self.number && self.number.feature && self.number.feature.timeCondition) || [],
        infos: {
            name: "timeCondition",
            actions: [
                {
                    name: bulkActionNames.deleteCondition,
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition/{id}",
                    method: "DELETE",
                    params: null
                },
                {
                    name: bulkActionNames.createCondition,
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition",
                    method: "POST",
                    params: null
                },
                {
                    name: bulkActionNames.editCondition,
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/condition/{id}",
                    method: "PUT",
                    params: null
                },
                {
                    name: bulkActionNames.options,
                    route: "/telephony/{billingAccount}/timeCondition/{serviceName}/options",
                    method: "PUT",
                    params: null
                }
            ]
        }
    };

    self.getBulkParams = function (action) {
        switch (action) {
        case bulkActionNames.createCondition:
        case bulkActionNames.deleteCondition:
        case bulkActionNames.editCondition:
            return self.getTimeConditions(action);
        case bulkActionNames.options:
            var condition = self.number.feature.timeCondition;
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

        self.number.feature.timeCondition.stopEdition().stopSlotsEdition(false, false, true).stopConditionsEdition(true, true).startEdition();
        OvhApiTelephony.TimeCondition().resetCache();
        TelephonyMediator.resetAllCache();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_calls_time_condition_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    self.getTimeConditions = function (action) {
        var conditions = _.filter(self.number.feature.timeCondition.conditions, function (condition) {
            switch (action) {
            case bulkActionNames.createCondition:
                return condition.state === "TO_CREATE";
            case bulkActionNames.deleteCondition:
                return condition.state === "TO_DELETE";
            case bulkActionNames.editCondition:
                return condition.state === "TO_EDIT";
            default:
                return false;
            }
        });

        return _.map(conditions, function (condition) {
            return {
                id: condition.conditionId,
                day: condition.weekDay,
                hourBegin: voipTimeCondition.getSipTime(condition.timeFrom),
                hourEnd: voipTimeCondition.getSipTime(condition.timeTo, true),
                policy: condition.policy,
                status: condition.status
            };
        });
    };

    /* -----  End of BULK  ------ */

});
