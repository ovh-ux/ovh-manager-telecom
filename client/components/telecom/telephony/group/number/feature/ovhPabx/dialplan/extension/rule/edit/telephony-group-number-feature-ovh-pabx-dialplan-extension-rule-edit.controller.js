angular.module("managerApp").controller("telephonyNumberOvhPabxDialplanExtensionRuleEditCtrl", function ($scope, $q, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.state = {
        collapse: false
    };

    self.parentCtrl = null;
    self.ovhPabx = null;
    self.rule = null;
    self.availableActions = null;
    self.services = [];

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isRuleValid = function () {
        switch (self.rule.getActionFamily()) {
        case "playback":
        case "voicemail":
        case "ivr":
        case "hunting":
        case "tts":
            return self.rule.actionParam;
        default:
            return true;
        }
    };

    self.isFormValid = function () {
        var ttsForm = _.get(self.extensionRuleForm, "$ctrl.ttsCreateForm");
        return ttsForm ? self.extensionRuleForm.$valid && (ttsForm.$valid || ttsForm.$invalid) : self.extensionRuleForm;
    };

    /**
     *  @todo refactor with service choice popover
     */
    self.getServiceType = function (service) {
        if (service.serviceType === "alias") {
            return "number";
        }
        if (!service.isFax && service.isTrunk && service.isTrunk()) {
            return "trunk";
        } else if (service.isFax) {
            return "fax";
        }
        return service.isPlugNFax ? "plug_fax" : "line";


    };

    /**
     *  @todo refactor with service choice popover
     */
    self.getServiceDisplayedName = function (service, isGroup) {
        if (isGroup) {
            return service.description && service.description !== service.billingAccount ? service.description + " - " + service.billingAccount : service.billingAccount;
        }
        return service.description && service.description !== service.serviceName ? service.description + " - " + service.serviceName : service.serviceName;

    };

    /**
     *  @todo refactor with service choice popover
     */
    self.getServiceGroupName = function (service) {
        return self.getServiceDisplayedName(_.find(TelephonyMediator.groups, {
            billingAccount: service.billingAccount
        }), true);
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    /* ----------  ACTION CHOICE   ----------*/

    self.onActionChangeClick = function () {
        self.parentCtrl.popoverStatus.rightPage = "actions";
        self.parentCtrl.popoverStatus.move = true;
    };

    self.onRuleActionChange = function () {
        self.parentCtrl.popoverStatus.move = false;
        self.rule.actionParam = "";
    };

    /* ----------  PLAYBACK ACTIONS  ----------*/

    self.onPlaybackActionParamButtonClick = function () {
        self.parentCtrl.popoverStatus.rightPage = "playback";
        self.parentCtrl.popoverStatus.move = true;
    };

    self.onSoundSelected = function () {
        self.parentCtrl.popoverStatus.move = false;
    };

    /* ----------  VOICEMAIL ACTIONS  ----------*/

    self.onVoicemailActionParamChange = function (service) {
        self.rule.actionParam = service.serviceName;
    };

    /* ----------  IVR ACTIONS  ----------*/

    self.onIvrActionParamButtonClick = function () {
        self.parentCtrl.popoverStatus.rightPage = "ivr";
        self.parentCtrl.popoverStatus.move = true;
    };

    self.onIvrMenuSelectedChange = function (menu) {
        if (menu) {
            self.parentCtrl.popoverStatus.move = false;
        }
    };

    self.onAddIvrMenuButtonClick = function () {
        // close popover
        self.parentCtrl.popoverStatus.isOpen = false;

        // create sub menu for menu entry
        self.rule.ivrMenu = self.ovhPabx.addMenu({
            name: $translate.instant("telephony_number_feature_ovh_pabx_step_rule_ivr_menu_add_menu_new_name", {
                index: self.ovhPabx.menus.length + 1
            }),
            oldParent: angular.copy(self.rule.saveForEdition),
            status: "DRAFT"
        });

        // stop edition of menu entry
        self.rule.stopEdition();
    };

    /* ----------  HUNTING  ----------*/

    self.onHuntingActionParamButtonClick = function () {
        self.parentCtrl.popoverStatus.rightPage = "hunting";
        self.parentCtrl.popoverStatus.move = true;
    };

    /* ----------  TTS  ----------*/

    self.onTtsActionParamButtonClick = function () {
        self.parentCtrl.popoverStatus.rightPage = "tts";
        self.parentCtrl.popoverStatus.move = true;
    };

    self.onAddTtsButtonClick = function () {
        self.state.collapse = true;
    };

    self.onTtsCreationCancel = function () {
        self.state.collapse = false;
    };

    self.onTtsCreationSuccess = function (tts) {
        self.rule.actionParam = tts.id;
        self.state.collapse = false;
        self.parentCtrl.popoverStatus.move = false;
    };

    /* ----------  FOOTER ACTIONS  ----------*/

    self.onValidateBtnClick = function () {
        var actionPromise = self.rule.status === "DRAFT" ? self.rule.create() : self.rule.save();

        self.parentCtrl.popoverStatus.isOpen = false;

        return actionPromise.then(function () {
            self.rule.stopEdition();
            self.parentCtrl.numberCtrl.jsplumbInstance.customRepaint();
        }).catch(function (error) {
            var errorTranslationKey = self.rule.status === "DRAFT" ? "telephony_number_feature_ovh_pabx_step_rule_create_error" : "telephony_number_feature_ovh_pabx_step_rule_edit_error";
            Toast.error([$translate.instant(errorTranslationKey), _.get(error, "data.message") || ""].join(" "));
            return $q.reject(error);
        });
    };

    self.onCancelBtnClick = function () {
        self.parentCtrl.popoverStatus.isOpen = false;

        if (self.rule.status === "DRAFT") {
            self.parentCtrl.extensionCtrl.extension.removeRule(self.rule);
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /**
     *  Rule edition initialization
     */
    self.$onInit = function () {
        self.loading.init = true;

        self.parentCtrl = $scope.$parent.$ctrl;

        // get rule
        self.rule = self.parentCtrl.rule || self.parentCtrl.dialplanRule;

        // set ovh pabx ref
        self.ovhPabx = self.parentCtrl.numberCtrl.number.feature;

        // start rule edition
        self.rule.startEdition();

        // get available services through billing accounts
        angular.forEach(TelephonyMediator.groups, function (group) {
            self.services = self.services.concat(group.fax, group.lines);
        });

        // get available actions
        return TelephonyMediator.getApiModelEnum("telephony.OvhPabxDialplanExtensionRuleActionEnum").then(function (enumValues) {
            self.availableActions = _.chain(enumValues).filter(function (enumVal) {
                if (self.ovhPabx.featureType === "cloudIvr") {
                    return enumVal !== "hunting" && enumVal !== "tts";
                } else if (!self.ovhPabx.isCCS) {
                    return enumVal !== "ivr" && enumVal !== "tts";
                }
                return true;

            }).map(function (enumVal) {
                return {
                    value: enumVal,
                    label: $translate.instant("telephony_number_feature_ovh_pabx_step_rule_" + _.snakeCase(enumVal)),
                    explain: $translate.instant("telephony_number_feature_ovh_pabx_step_rule_" + _.snakeCase(enumVal) + "_explain")
                };
            }).value();
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /**
     *  Rule edition destroy
     */
    self.$onDestroy = function () {
        if (self.rule && !self.parentCtrl.isLoading()) {
            self.rule.stopEdition(true);
        }
    };

    /* -----  End of INITIALIZATION  ------*/

});
