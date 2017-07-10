angular.module("managerApp").controller("TelecomTelephonyLinePhoneConfigurationCtrl", function ($scope, $q, $timeout, $state, $stateParams, $translate, TelephonyMediator, Toast, validator, TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS) {
    "use strict";

    var self = this;

    self.line = null;
    self.configGroups = null;
    self.allGroups = [];

    self.loading = {
        init: false,
        save: false,
        grouping: false
    };
    self.model = {
        expertMode: false,
        manage: false,
        reboot: false
    };
    self.hasExpertConfigs = false;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function groupConfigs () {
        var groupedConfigs = _.groupBy(self.line.phone.configurations, "group");
        var additionalPhoneInfos = _.get(TELEPHONY_LINE_PHONE_ADDITIONAL_INFOS, self.line.phone.brand);

        self.allGroups = [];

        angular.forEach(groupedConfigs, function (configs, group) {
            self.allGroups.push(angular.extend({
                name: group,
                configs: _.sortBy(configs, "name"),
                isExpertOnly: _.every(configs, {
                    level: "expert"
                })
            }, additionalPhoneInfos && _.has(additionalPhoneInfos, "additionalConfiguration." + group) ? _.get(additionalPhoneInfos, "additionalConfiguration." + group) : {}));
        });

        // first sort by group name and then set priority on general group (null) and proxy
        self.allGroups.sort(function (groupA, groupB) {
            var nullResultA = groupA.name === "null";
            var nullResultB = groupB.name === "null";

            if (nullResultA) {
                return -1;
            } else if (nullResultB) {
                return 1;
            }

            nullResultA = groupA.name === "OutboundProxy";
            nullResultB = groupB.name === "OutboundProxy";

            if (nullResultA) {
                return -1;
            } else if (nullResultB) {
                return 1;
            }

            var translatedA = $translate.instant("telephony_line_phone_configuration_group_" + _.snakeCase(groupA.name));
            var translatedB = $translate.instant("telephony_line_phone_configuration_group_" + _.snakeCase(groupB.name));

            if (translatedA > translatedB) {
                return 1;
            } else if (translatedA < translatedB) {
                return -1;
            }
            return 0;

        });
    }

    function refreshChunkedGroups () {
        var chunkSize = self.model.manage ? 1 : 2;

        if (!self.model.expertMode) {
            self.configGroups = _.chain(self.allGroups).filter({
                isExpertOnly: false
            }).chunk(chunkSize).value();
        } else {
            self.configGroups = _.chunk(self.allGroups, chunkSize);
        }
    }

    function resetView () {
        groupConfigs();
        refreshChunkedGroups();
        self.model.reboot = false;
    }

    self.getModifiedConfigs = function () {
        return _.filter(self.line.phone.configurations, function (config) {
            return !_.isEqual(config.value, config.prevValue);
        });
    };

    self.getNonDefaultConfigs = function () {
        return _.filter(self.line.phone.configurations, function (config) {
            return !_.isEqual(config.value, config.default);
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            ACTIONS            =
    ==============================*/

    self.onExpertModeChange = function () {
        self.loading.grouping = true;

        // use of timeout because display is bad when using ovh-form-flat selects
        $timeout(function () {
            refreshChunkedGroups();
            self.loading.grouping = false;
        });
    };

    self.onTextInputBlur = function (config) {
        if (_.isEmpty(config.value)) {
            config.value = config.prevValue;
        }
    };

    self.reinitValues = function () {
        angular.forEach(self.getModifiedConfigs(), function (config) {
            config.value = config.prevValue;
        });

        self.model.manage = !self.model.manage;
        refreshChunkedGroups();
        self.model.reboot = false;
    };

    self.defaultValues = function () {
        angular.forEach(self.getNonDefaultConfigs(), function (config) {
            config.value = config.default;
        });

        if (!self.model.expertMode && self.hasExpertConfigs) {
            Toast.info($translate.instant("telephony_line_phone_configuration_default_info"));
        }
    };

    self.saveNewConfigurations = function () {
        var savePromise;
        var dynamicConfigs = [];

        self.loading.save = true;

        _.each(_.filter(self.allGroups, function (group) {
            return group.dynamicConfigs && _.isArray(group.dynamicConfigs) && group.dynamicConfigs.length > 0;
        }), function (group) {
            dynamicConfigs = dynamicConfigs.concat(group.dynamicConfigs);
        });

        savePromise = self.line.phone.changePhoneConfiguration(null, !dynamicConfigs.length, dynamicConfigs.length ? false : self.model.reboot).then(function () {
            if (dynamicConfigs.length) {
                savePromise = self.line.phone.changePhoneConfiguration(dynamicConfigs, true, self.model.reboot);
                return savePromise;
            }
            return null;
        });

        return savePromise.then(function () {
            self.model.manage = false;
            resetView();
            Toast.success($translate.instant("telephony_line_phone_configuration_save_success"));
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_phone_configuration_save_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {

            self.line = group.getLine($stateParams.serviceName);

            return self.line.getPhone().then(function () {
                if (!self.line.hasPhone && !self.line.phone) {
                    return $state.go("telecom.telephony.line.phone");
                }

                self.hasExpertConfigs = !_.every(self.line.phone.configurations, {
                    level: null
                });
                resetView();
                return null;
            }, function (error) {
                Toast.error([$translate.instant("telephony_line_phone_configuration_load_error"), (error.data && error.data.message) || ""].join(" "));
                return $q.reject(error);
            });
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_phone_configuration_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    $scope.$on("$destroy", function () {
        if (self.model.manage) {
            self.reinitValues();
        }
    });

    /* -----  End of INITIALIZATION  ------*/

    init();

});
