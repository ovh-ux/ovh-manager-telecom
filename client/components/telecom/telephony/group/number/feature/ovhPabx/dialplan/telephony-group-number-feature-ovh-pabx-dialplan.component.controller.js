angular.module("managerApp").controller("telephonyNumberOvhPabxDialplanCtrl", function ($q, $timeout, $translate, Toast, UI_SORTABLE_HELPERS) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.popoverStatus = {
        isOpen: false,
        move: false,
        rightPage: null
    };

    self.displayHelpers = {
        collapsed: false,
        expanded: true
    };

    self.sortableOptions = null;
    self.ovhPabx = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isLoading = function () {
        return self.loading.init || (self.dialplan && ["OK", "DRAFT", "DELETE_PENDING"].indexOf(self.dialplan.status) === -1);
    };

    function hasSubMenuEntryInEdition (entry) {
        var menuSub = entry.action === "menuSub" && (entry.menuSub || self.ovhPabx.getMenu(entry.actionParam));
        return entry.inEdition || (menuSub && (menuSub.inEdition || _.some(menuSub.entries, hasSubMenuEntryInEdition)));
    }

    function hasRuleMenuInEdition (rule) {
        var menu = rule.action === "ivr" && (rule.ivrMenu || self.ovhPabx.getMenu(rule.actionParam));
        return rule.inEdition || (menu && (menu.inEdition || _.some(menu.entries, hasSubMenuEntryInEdition)));
    }

    function hasExtensionRuleInEdition (extension) {
        return extension.inEdition || _.some(extension.rules, hasRuleMenuInEdition) || _.some(extension.negativeRules, hasRuleMenuInEdition);
    }

    self.isActionsDisabled = function () {
        var isActionsDisabled = self.dialplan && (self.dialplan.inEdition || self.isLoading() || _.some(self.dialplan.extensions, hasExtensionRuleInEdition));

        // self.sortableOptions.disabled = isActionsDisabled;

        return isActionsDisabled;
    };

    self.hasInCreationExtension = function () {
        return _.some(self.dialplan.extensions, {
            status: "IN_CREATION"
        });
    };

    function createDialplan () {
        // add a dialplan to ovh pabx instance
        var dialplanToCreate = self.ovhPabx.addDialplan({
            name: $translate.instant("telephony_number_feature_ovh_pabx_dialplan_new_name"),
            status: "DRAFT"
        });

        // create it from API
        return dialplanToCreate.create().catch(function (error) {
            // remove extension from dialplan list
            self.ovhPabx.removeDialplan(dialplanToCreate);
            return $q.reject(error);
        }).finally(function () {
            // refresh current dialplan
            self.ovhPabxCtrl.refreshDisplayedDialplan();
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onEditDialplanBtnClick = function () {
        self.popoverStatus.isOpen = true;
    };

    self.onDialplanCollapsed = function () {
        self.numberCtrl.jsplumbInstance.customRepaint().then(function () {
            self.numberCtrl.jsplumbInstance.getAllConnections().forEach(function (connection) {
                connection.setVisible(true);
            });
            self.displayHelpers.expanded = false;
        });
    };

    self.onDialplanCollapsing = function () {
        self.numberCtrl.jsplumbInstance.getAllConnections().forEach(function (connection) {
            connection.setVisible(false);
        });
    };

    self.onDialplanExpanding = function () {
        console.log("coucou ???");
        self.displayHelpers.expanded = true;
    };

    self.onDialplanExpanded = function () {
        self.numberCtrl.jsplumbInstance.customRepaint();
    };

    self.onExtensionAddBtnClick = function () {
        var addedExtension = self.dialplan.addExtension({
            position: self.dialplan.extensions.length + 1,
            status: "DRAFT"
        });

        return addedExtension.create();
    };

    /**
     *  Manage dialplan delete confirm button click.
     *  Deleting a dialplan means deleting its configuration (extension, rules, ...). Once dialplan is deleted, create a new one with default title.
     */
    self.onDialplanDeleteConfirmBtnClick = function () {
        return self.dialplan.remove().then(function () {
            self.ovhPabx.removeDialplan(self.dialplan);
            return createDialplan();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_dialplan_delete_error"), error.data && error.data.message].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.ovhPabxDialplanCtrl.loading.remove = false;
        });
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        var sortInterval = null;
        var initPromise = $q.when(true);
        self.loading.init = true;

        // set ovhPabx instance
        self.ovhPabx = self.numberCtrl.number.feature;

        // set sortable options
        self.sortableOptions = {
            axis: "y",
            handle: ".rule-grip",
            cancel: ".voip-plan__step-icon--grip-disabled",
            containment: "parent",
            sort: UI_SORTABLE_HELPERS.variableHeightTolerance,
            start: function () {
                sortInterval = setInterval(function () {
                    self.numberCtrl.jsplumbInstance.repaintEverything();
                }, 33);
            },
            stop: function () {
                if (sortInterval) {
                    clearInterval(sortInterval);

                    // redraw links for the last time
                    self.numberCtrl.jsplumbInstance.customRepaint();
                }
            },
            update: function () {
                $timeout(function () {
                    // update extensions positions
                    angular.forEach(self.dialplan.extensions, function (extension, index) {
                        extension.position = index + 1;
                    });

                    // call api to update all positions
                    self.dialplan.updateExtensionsPositions();
                });
            }
        };

        if (self.dialplan) {
            // load extension if dialplan exists
            initPromise = self.dialplan.getExtensions();
        } else if (self.numberCtrl.number.feature.dialplans.length === 0) {
            initPromise = createDialplan();
        }

        return initPromise.finally(function () {
            self.loading.init = false;
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_load_error"), _.get(error, "data.message") || ""].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
