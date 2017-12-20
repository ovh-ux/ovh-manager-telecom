angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationChangeTypeCtrl", function ($scope, $q, $translate, $state, $stateParams, TelephonyMediator, Toast, voipServiceTask, telephonyBulk) {
    "use strict";

    var self = this;

    self.number = null;
    self.noCache = false;
    self.loading = {
        changing: false,
        line: true
    };

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.changeType = function () {
        self.loading.changing = true;

        return self.number.changeFeatureType().then(function () {
            self.number.feature.stopEdition();
            $state.go("telecom.telephony.alias.configuration");
            return Toast.success($translate.instant("telephony_alias_change_type_ok"));
        }, function (error) {
            if (error.type !== "poller") {
                // Do not display Toast if it is a poller error
                Toast.error([$translate.instant("telephony_alias_change_type_ko"), (error.data && error.data.message) || ""].join(" "));
            }
            return $q.reject(error);
        }).finally(function () {
            self.loading.changing = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.line = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount, self.noCache).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);
            return self.number;
        }).then(function () {
            self.availableTypes = [
                { id: "redirect", label: $translate.instant("telephony_alias_config_change_type_label_redirect") },
                { id: "ddi", label: $translate.instant("telephony_alias_config_change_type_label_ddi") },
                { id: "conference", label: $translate.instant("telephony_alias_config_change_type_label_conference") },
                { id: "cloudIvr", label: $translate.instant("telephony_alias_config_change_type_label_cloudIvr") },
                { id: "svi", label: $translate.instant("telephony_alias_config_change_type_label_svi") },
                { id: "easyHunting", label: $translate.instant("telephony_alias_config_change_type_label_easyHunting") },
                { id: "cloudHunting", label: $translate.instant("telephony_alias_config_change_type_label_cloudHunting") },
                { id: "contactCenterSolution", label: $translate.instant("telephony_alias_config_change_type_label_contactCenterSolution") },
                { id: "contactCenterSolutionExpert", label: $translate.instant("telephony_alias_config_change_type_label_contactCenterSolutionExpert") },
                { id: "empty", label: $translate.instant("telephony_alias_config_change_type_label_empty") }
            ];

            self.number.feature.startEdition();
            self.noCache = false;

            return self.number;
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.line = false;
        });
    }

    $scope.$on("$destroy", function () {
        if (self.number && self.number.feature) {
            self.number.feature.stopEdition(true);
        }
    });

    /* -----  End of INITIALIZATION  ------*/

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "configurationNumberChangeType",
            actions: [{
                name: "options",
                route: "/telephony/{billingAccount}/number/{serviceName}/changeFeatureType",
                method: "POST",
                params: null
            }]
        }
    };

    self.getBulkParams = function () {
        var data = {
            featureType: self.number.feature.featureType
        };

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {

        // check if server tasks are all successful
        self.checkServerTasksStatus(bulkResult.success).then(function (errorCount) {
            if (errorCount > 0) {
                Toast.warn([$translate.instant("telephony_alias_config_change_type_bulk_server_tasks_some_error")]);
            }

            telephonyBulk.getToastInfos(bulkResult, {
                fullSuccess: $translate.instant("telephony_alias_config_change_type_bulk_all_success"),
                partialSuccess: $translate.instant("telephony_alias_config_change_type_bulk_some_success", {
                    count: bulkResult.success.length
                }),
                error: $translate.instant("telephony_alias_config_change_type_bulk_error")
            }).forEach(function (toastInfo) {
                Toast[toastInfo.type](toastInfo.message, {
                    hideAfter: null
                });
            });

            self.changeType();
            self.noCache = true;

            // reset initial values to be able to modify again the options
            init();
        }, function () {
            Toast.error([$translate.instant("telephony_alias_config_change_type_bulk_server_tasks_all_error")]);
        });
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_alias_config_change_type_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    self.checkServerTasksStatus = function (updatedServices) {
        self.loading.changing = true;

        var deferred = $q.defer();
        var promises = [];
        var tasksAndServicesInfos = [];

        _.forEach(updatedServices, function (service) {
            var info = {
                billingAccount: service.billingAccount,
                serviceName: service.serviceName,
                id: _.chain(service.values).map("value").filter(function (val) {
                    return val.action === "changeType";
                }).value()[0].taskId
            };

            tasksAndServicesInfos.push(info);
        });

        _.forEach(tasksAndServicesInfos, function (task) {
            promises.push(voipServiceTask.startPolling(task.billingAccount, task.serviceName, task.id));
        });

        // return deferred.promise;
        $q.all(promises).then(function () {
            deferred.resolve();
        }, function (errors) {
            var nbTasksInError = _.sumBy(errors, function (e) {
                return e.status.toLowerCase() !== "done" && e.status.toLowerCase() !== "cancelled" ? 1 : 0;
            });

            if (nbTasksInError < errors.length) {
                deferred.resolve(nbTasksInError);
            } else {
                deferred.reject();
            }
        });

        return deferred.promise;
    };

    /* -----  End of BULK  ------ */

    init();

});
