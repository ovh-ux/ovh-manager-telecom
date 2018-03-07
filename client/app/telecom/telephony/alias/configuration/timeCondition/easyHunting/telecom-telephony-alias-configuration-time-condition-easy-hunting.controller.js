angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationTimeConditionEasyHuntingCtrl", function ($q, $stateParams, $translate, $uibModal,
                                                                                                                    OvhApiTelephony, TelephonyMediator, Toast, uiCalendarConfig, telephonyBulk,
                                                                                                                    VoipTimeConditionCondition, voipTimeConditionConfiguration) {
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
            return ["easyHunting", "contactCenterSolution"].indexOf(service.featureType) > -1;
        });
    };

    self.bulkDatas = {
        conditions: (self.number && self.number.feature && self.number.feature.timeCondition) || [],
        infos: {
            name: "timeConditionEasyHunting",
            actions: [
                {
                    name: bulkActionNames.deleteCondition,
                    route: "/telephony/{billingAccount}/easyHunting/{serviceName}/timeConditions/conditions/{conditionId}",
                    method: "DELETE",
                    params: null
                },
                {
                    name: bulkActionNames.createCondition,
                    route: "/telephony/{billingAccount}/easyHunting/{serviceName}/timeConditions/conditions",
                    method: "POST",
                    params: null
                },
                {
                    name: bulkActionNames.editCondition,
                    route: "/telephony/{billingAccount}/easyHunting/{serviceName}/timeConditions/conditions/{conditionId}",
                    method: "PUT",
                    params: null
                },
                {
                    name: bulkActionNames.options,
                    route: "/telephony/{billingAccount}/easyHunting/{serviceName}/timeConditions",
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
                slot1Type: !_.isNull(condition.slots[1].number) ? condition.slots[1].type : "",
                slot2Number: condition.slots[2].number,
                slot2Type: !_.isNull(condition.slots[2].number) ? condition.slots[2].type : "",
                slot3Number: condition.slots[3].number,
                slot3Type: !_.isNull(condition.slots[3].number) ? condition.slots[3].type : "",
                enable: condition.enable,
                unavailableNumber: condition.slots[4].number,
                unavailableType: !_.isNull(condition.slots[4].number) ? condition.slots[4].type : ""
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
                conditionId: condition.conditionId,
                weekDay: condition.weekDay,
                timeFrom: condition.timeFrom,
                timeTo: condition.timeTo,
                policy: condition.policy,
                status: condition.status
            };
        });
    };

    /* -----  End of BULK  ------ */
});
