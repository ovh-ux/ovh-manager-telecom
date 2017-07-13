angular.module("managerApp").controller("telephonyNumberOvhPabxMenuCtrl", function ($q, $scope, $timeout, $translate, $translatePartialLoader, Toast, TELEPHONY_NUMBER_JSPLUMB_ENDPOINTS_OPTIONS, TELEPHONY_NUMBER_JSPLUMB_CONNECTIONS_OPTIONS) {
    "use strict";

    var self = this;

    self.loading = {
        translations: false,
        init: false,
        jsPlumb: false
    };

    self.popoverStatus = {
        isOpen: false,
        move: false,
        templateUrl: "components/telecom/telephony/group/number/feature/ovhPabx/menu/edit/telephony-group-number-feature-ovh-pabx-menu-edit.html",
        isParentClicked: false
    };

    self.jsPlumbEndpointsOptions = TELEPHONY_NUMBER_JSPLUMB_ENDPOINTS_OPTIONS;
    self.jsPlumbConnectionsOptions = TELEPHONY_NUMBER_JSPLUMB_CONNECTIONS_OPTIONS;
    self.uuid = _.uniqueId("ovhPabx_menu_");
    self.parentCtrl = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isLoading = function () {
        return self.loading.init || (self.menu && ["OK", "DRAFT", "DELETE_PENDING"].indexOf(self.menu.status) === -1);
    };

    self.isDisabled = function () {
        return self.extensionCtrl && !self.extensionCtrl.extension.enabled;
    };

    self.hasMenuEntryOrDialPlanExtension = function () {
        return !!(self.menuEntry || self.dialplanRule);
    };

    self.getParentEndpointUuid = function () {
        if (self.dialplanRule && self.dialplanRule.negativeAction) {
            return self.parentCtrl.uuid + "-condition";
        }
        return self.parentCtrl.uuid;

    };

    self.getEndpointUuid = function () {
        return self.uuid;
    };

    function hasSubMenuEntryInEdition (entry) {
        var menuSub = entry.action === "menuSub" && (entry.menuSub || self.ovhPabx.getMenu(entry.actionParam));
        return entry.inEdition || (menuSub && (menuSub.inEdition || _.some(menuSub.entries, hasSubMenuEntryInEdition)));
    }

    self.isActionsDisabled = function () {
        return self.menu && (self.menu.inEdition || self.isLoading() || _.some(self.menu.entries, hasSubMenuEntryInEdition) || (self.menuCtrl && self.menuCtrl.isActionsDisabled()) || (self.dialplanCtrl && self.dialplanCtrl.isActionsDisabled()));
    };

    self.getEntryAttr = function (attr, entryParam) {
        var entry = entryParam;
        if (!entry) {
            entry = self.menuEntry;
        }
        return _.get(entry.inEdition ? entry.saveForEdition : entry, attr);
    };

    self.getRuleAttr = function (attr) {
        return _.get(self.dialplanRule.inEdition ? self.dialplanRule.saveForEdition : self.dialplanRule, attr);
    };

    self.getDialplanRuleRealPosition = function () {
        if (!self.extensionCtrl) {
            return 1;
        }
        return _.indexOf(self.dialplanRule.negativeAction ? self.extensionCtrl.extension.negativeRules : self.extensionCtrl.extension.rules, self.dialplanRule) + 1;
    };

    self.getEntryMenu = function (entry) {
        var entryActionParam = self.getEntryAttr("actionParam", entry);
        if (_.isNumber(entryActionParam)) {
            return self.ovhPabx.getMenu(entryActionParam);
        }
        return entry.menuSub;

    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onEditMenuBtnClick = function () {
        self.popoverStatus.templateUrl = "components/telecom/telephony/group/number/feature/ovhPabx/menu/edit/telephony-group-number-feature-ovh-pabx-menu-edit.html";
        self.popoverStatus.isOpen = true;
    };

    self.onEditMenuEntryBtnClick = function () {
        self.popoverStatus.templateUrl = "components/telecom/telephony/group/number/feature/ovhPabx/menu/entry/edit/telephony-group-number-feature-ovh-pabx-menu-entry-edit.html";
        self.popoverStatus.isOpen = true;
    };

    self.onDialplanRuleEditBtnClick = function () {
        self.popoverStatus.templateUrl = "components/telecom/telephony/group/number/feature/ovhPabx/dialplan/extension/rule/edit/telephony-group-number-feature-ovh-pabx-dialplan-extension-rule-edit.html";
        self.popoverStatus.isOpen = true;
    };

    self.onDeleteCancelBtnClick = function () {
        if (!self.hasMenuEntryOrDialPlanExtension()) {
            self.menu.status = "OK";
        } else if (self.menuEntry) {
            self.menuEntry.status = "OK";
        } else if (self.dialplanRule) {
            self.dialplanRule.status = "OK";
        }
    };

    self.onMenuDeleteConfirmBtnClick = function () {
        if (!self.hasMenuEntryOrDialPlanExtension()) {
            return self.menu.remove().then(function () {
                self.ovhPabx.removeMenu(self.menu);
                self.menu = null;
            }).catch(function (error) {
                var errorTranslationKey = "telephony_number_feature_ovh_pabx_menu_action_delete_error";
                if (error.status === 403) {
                    errorTranslationKey = "telephony_number_feature_ovh_pabx_menu_action_delete_error_used";
                }
                Toast.error([$translate.instant(errorTranslationKey), _.get(error, "data.message") || ""].join(" "));
                return $q.reject(error);
            });
        }
        if (self.menuEntry) {
            return self.menuEntry.remove().then(function () {
                self.menuCtrl.menu.removeEntry(self.menuEntry);
                self.menuEntry = null;
            }).catch(function (error) {
                Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_menu_entry_delete_error"), _.get(error, "data.message") || ""].join(" "));
                return $q.reject(error);
            });
        } else if (self.dialplanRule) {
            return self.dialplanRule.remove().then(function () {
                self.extensionCtrl.extension.removeRule(self.dialplanRule);
                self.dialplanRule = null;
            }).catch(function (error) {
                Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_menu_entry_delete_error"), _.get(error, "data.message") || ""].join(" "));
                return $q.reject(error);
            });
        }
        return $q.when(null);
    };

    self.addMenuEntry = function () {
        self.popoverStatus.isParentClicked = true;

        return self.menu.addEntry({
            position: self.menu.entries.length + 1,
            dtmf: self.menu.getFirstAvailableDtmfEntryKey(),
            status: "DRAFT"
        });
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Translations load  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx");
        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx/menu");
        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx/tts");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        var initPromises = {
            translations: getTranslations()
        };

        if (!self.numberCtrl && !self.menuCtrl && !self.ovhPabx) {
            throw new Error("telephonyNumberOvhPabxMenu must have telephonyNumber or telephonyNumberOvhPabxMenu component as parent or must have ovhPabx attribute specified");
        }

        self.loading.init = true;

        // set ovhPabx from number component if needed
        if (!self.ovhPabx) {
            self.ovhPabx = self.numberCtrl ? self.numberCtrl.number.feature : self.menuCtrl.ovhPabx;
        }

        // set jsplumb instance from number component if needed
        if (!self.jsplumbInstance) {
            self.jsplumbInstance = self.numberCtrl ? self.numberCtrl.jsplumbInstance : self.menuCtrl.jsplumbInstance;
        }

        self.popoverStatus.isOpen = self.menu && self.menu.status === "DRAFT";

        // set parent ctrl to get uuid
        self.parentCtrl = self.menuCtrl || self.extensionCtrl || {};

        // set controller uuid
        self.uuid = _.uniqueId("ovhPabx_menu_".concat(self.menu.menuId));

        if (self.menu.status !== "DRAFT") {
            initPromises.entries = self.menu.getEntries();
            initPromises.tts = self.ovhPabx.getTts();
        }

        return $q.all(initPromises).finally(function () {
            self.loading.init = false;
        });
    };

    self.$onDestroy = function () {
        if (self.menu) {
            self.menu.stopEdition(true);
        }
    };

    $scope.$watch("$ctrl.menu.menuId", function (newMenuId, oldMenuId) {
        if (oldMenuId && oldMenuId !== newMenuId) {
            $timeout(function () {
                self.$onInit();
            });
        }
    });

    /* -----  End of INITIALIZATION  ------*/

});
