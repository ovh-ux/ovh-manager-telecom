angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationChangeTypeCtrl", function ($scope, $q, $translate, $state, $stateParams, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.number = null;

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

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
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

    init();

});
