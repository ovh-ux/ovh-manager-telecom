angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.actions = null;
    self.number = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getFeatureTypeActions () {
        switch (self.number.getFeatureFamily()) {
        case "redirect":
        case "svi":
            return [];
        case "ovhPabx":
            var ovhPabxActions = [];
            if (self.number.feature.featureType === "cloudHunting") {
                if (self.number.feature.isCCS) {
                    ovhPabxActions = [{
                        name: "number_cloud_hunting_agents",
                        sref: "telecom.telephony.alias.configuration.agents.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_agents")
                    }, {
                        name: "number_cloud_hunting_queues",
                        sref: "telecom.telephony.alias.configuration.queues.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_queues")
                    }];
                } else {
                    ovhPabxActions = [];
                }
            }

            if (!self.number.feature.isCCS) {
                ovhPabxActions.push({
                    divider: true
                });

                // there is no menu for "File d'appel - mode expert"
                if (self.number.feature.featureType === "cloudIvr") {
                    ovhPabxActions.push({
                        name: "number_ovh_pabx_menus",
                        sref: "telecom.telephony.alias.configuration.ovhPabx.menus",
                        text: $translate.instant("telephony_alias_configuration_actions_menus_management")
                    });
                } else {
                    ovhPabxActions.push({
                        name: "number_easy_hunting_members",
                        sref: "telecom.telephony.alias.configuration.agents.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_members")
                    }, {
                        name: "number_cloud_hunting_queues",
                        sref: "telecom.telephony.alias.configuration.queues.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_queues")
                    });
                }
                ovhPabxActions = ovhPabxActions.concat({
                    name: "number_ovh_pabx_sounds",
                    sref: "telecom.telephony.alias.configuration.ovhPabx.sounds",
                    text: $translate.instant("telephony_alias_configuration_actions_sounds_management")
                }, {
                    divider: true
                }, {
                    name: "number_cloud_hunting_events",
                    sref: "telecom.telephony.alias.configuration.scheduler.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_events")
                });
            } else {
                ovhPabxActions = ovhPabxActions.concat({
                    name: "number_cloud_hunting_events",
                    sref: "telecom.telephony.alias.configuration.scheduler.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_events")
                }, {
                    name: "number_cloud_hunting_configuration",
                    url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_configuration"),
                    text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_configuration")
                });
            }

            if (self.number.feature.isCCS) {
                // if it is a CCS => add records management page link
                ovhPabxActions.push({
                    name: "number_cloud_hunting_board",
                    url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_board"),
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_board")
                }, {
                    name: "number_cloud_hunting_records",
                    sref: "telecom.telephony.alias.configuration.records.ovhPabx",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_records")
                });
            } else if (!self.number.feature.isCCS && self.number.feature.featureType !== "cloudIvr") {
                // if not a CSS: add possibility to upgrade to
                ovhPabxActions.splice(0, 0, {
                    name: "number_cloud_hunting_beta",
                    url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_beta"),
                    text: $translate.instant("telephony_alias_configuration_actions_number_cloud_hunting_beta")
                });
            }
            return ovhPabxActions;
        case "conference":
            return [];
        default:
            switch (self.number.feature.featureType) {
            case "easyHunting":
                var easyHuntingActions = [{
                    name: "number_easy_hunting_mode",
                    sref: "telecom.telephony.alias.configuration.mode.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_mode")
                }, {
                    name: "number_easy_hunting_members",
                    sref: "telecom.telephony.alias.configuration.members.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_members")
                }, {
                    name: "number_easy_hunting_slots",
                    sref: "telecom.telephony.alias.configuration.timeCondition.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_slots")
                }, {
                    name: "number_easy_hunting_events",
                    sref: "telecom.telephony.alias.configuration.scheduler.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_events")
                }, {
                    name: "number_easy_hunting_filtering",
                    sref: "telecom.telephony.alias.configuration.callsFiltering.easyHunting",
                    text: $translate.instant("telephony_alias_configuration_actions_number_hunting_filtering")
                }];

                if (self.number.feature.isCCS) {
                    // if it is a CCS => add records management page link
                    easyHuntingActions.push({
                        name: "number_easy_hunting_board",
                        sref: "telecom.telephony.alias.configuration.stats.easyHunting",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_board")
                    }, {
                        name: "number_cloud_hunting_records",
                        sref: "telecom.telephony.alias.configuration.records.ovhPabx",
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_records")
                    });
                } else {
                    // if not a CSS: add possibility to upgrade to
                    easyHuntingActions.splice(0, 0, {
                        name: "number_easy_hunting_beta",
                        url: TelephonyMediator.getV6ToV4RedirectionUrl("alias.number_cloud_hunting_beta"),
                        text: $translate.instant("telephony_alias_configuration_actions_number_hunting_beta")
                    });
                }
                return easyHuntingActions;
            default:
                return [];
            }
        }
    }

    self.isSubwayPlanActive = function () {
        if (["redirect", "svi", "conference"].indexOf(self.number.getFeatureFamily()) > -1) {
            return true;
        } else if ((self.number.feature.featureType === "cloudHunting" && !self.number.feature.isCCS) || self.number.feature.featureType === "cloudIvr") {
            return true;
        }
        return false;

    };

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function initActions () {
        return [{
            name: "number_modification_new",
            sref: "telecom.telephony.alias.configuration.changeType",
            text: $translate.instant("telephony_alias_configuration_actions_number_modification_new")
        }].concat(getFeatureTypeActions());
    }

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                self.actions = initActions();
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
