angular.module("managerApp").controller("telephonyNumberOvhPabxDialplanExtensionCtrl", function ($q, $scope, $timeout, $translate, Toast, UI_SORTABLE_HELPERS) {
    "use strict";

    var self = this;
    var redrawInterval = null;

    self.loading = {
        init: false
    };

    self.popoverStatus = {
        isOpen: false,
        move: false
    };

    self.displayHelpers = {
        collapsed: true,
        expanded: false,
        negativeCollapsed: true,
        negativeExpanded: false
    };

    self.ovhPabx = null;
    self.dialplan = null;

    self.rulesSortableOptions = null;
    self.negativeRulesSortableOptions = null;
    self.uuid = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isLoading = function () {
        return self.loading.init || (self.extension && (["OK", "DELETE_PENDING"].indexOf(self.extension.status) === -1 || _.some(self.extension.screenListConditions, function (screenListCondition) {
            return ["CREATING", "DELETING"].indexOf(screenListCondition.state) !== -1;
        }) || _.some(self.extension.timeConditions, function (timeCondition) {
            return ["CREATING", "DELETING"].indexOf(timeCondition.state) !== -1;
        })));
    };

    self.startRedraw = function () {
        if (!redrawInterval) {
            redrawInterval = setInterval(function () {
                self.numberCtrl.jsplumbInstance.customRepaint();
            }, 33);
        }
    };

    self.stopRedraw = function () {
        if (redrawInterval) {
            clearInterval(redrawInterval);
            redrawInterval = null;

            // redraw links for the last time
            self.numberCtrl.jsplumbInstance.customRepaint();
        }
    };

    self.getExtensionAttr = function (attr) {
        return _.get(self.extension.inEdition ? self.extension.saveForEdition : self.extension, attr);
    };

    self.extensionHasConditions = function () {
        return self.getExtensionAttr("schedulerCategory") || self.getExtensionAttr("screenListType") || self.getExtensionAttr("timeConditions").length;
    };

    self.getRuleAttr = function (attr, rule) {
        return _.get(rule.inEdition ? rule.saveForEdition : rule, attr);
    };

    self.getRuleMenu = function (rule) {
        var ruleActionParam = self.getRuleAttr("actionParam", rule);
        if (_.isNumber(ruleActionParam)) {
            return self.numberCtrl.number.feature.getMenu(ruleActionParam);
        }
        return rule.ivrMenu;

    };

    self.getRulesCount = function () {
        return self.extension.rules.length + self.extension.negativeRules.length;
    };

    self.getEndpointUuid = function () {
        return self.uuid;
    };

    function setConnectionVisibility (visibility) {
        $timeout(function () {
            self.numberCtrl.jsplumbInstance.getAllConnections().forEach(function (connection) {
                connection.setVisible(visibility);
            });
        }, 99);
    }

    /**
     *  Used to determine if rules must be displayed or not.
     *  Used by telephonyNumberOvhPabxDialplanExtensionRuleEditCtrl when a rule edition is canceled.
     *  Used by telephonyNumberOvhPabxDialplanExtensionRuleCtrl when a rule is deleted.
     */
    self.checkForDisplayHelpers = function () {
        if (!self.extension.rules.length) {
            self.displayHelpers.collapsed = true;
            self.displayHelpers.expanded = false;
        }
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.onExtensionOutsideClick = function () {
        if (self.extension.status !== "DELETE_PENDING") {
            return;
        }

        // cancel deletion confirm
        self.extension.status = "OK";
    };

    /* ----------  ACTIVATE/DESACTIVATE  ----------*/

    self.toggleEnabledState = function () {
        var actionPromise;

        self.loading.save = true;

        actionPromise = self.extension.enabled ? self.extension.disable() : self.extension.enable();

        return actionPromise.finally(function () {
            self.loading.save = false;
        });
    };

    /* ----------  ADD RULE  ----------*/

    self.addRule = function (isNegative) {
        if (!isNegative) {
            self.displayHelpers.collapsed = false;
            self.displayHelpers.expanded = true;
        } else {
            self.displayHelpers.negativeCollapsed = false;
            self.displayHelpers.negativeExpanded = true;
        }

        self.extension.addRule({
            position: isNegative ? self.extension.negativeRules.length + 1 : self.extension.rules.length + 1,
            status: "DRAFT",
            negativeAction: isNegative
        });
    };

    /* ----------  MANAGE CONDITIONS  ----------*/

    self.onManageConditionBtnClick = function () {
        self.popoverStatus.isOpen = true;
    };

    /* ----------  DELETE  ----------*/

    /**
     *  Call API to delete extension
     */
    self.onConfirmDeleteBtnClick = function () {
        return self.extension.remove().then(function () {
            // remove extension from list
            self.dialplan.removeExtension(self.extension);

            // check for other extensions that position needs to be updated
            // self.extension is not destroyed yet so use it to determine which extensions needs to update their positions
            self.dialplan.updateExtensionsPositions(self.extension.position);

            // display information about extension count
            self.dialplanCtrl.checkForDisplayHelpers();
        }, function (error) {
            Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_step_remove_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
        });
    };

    /* ----------  COLLAPSE  ---------- */

    self.onExtensionCollapsed = function (isNegative) {
        self.numberCtrl.jsplumbInstance.customRepaint().then(function () {
            setConnectionVisibility(true);
            _.set(self.displayHelpers, isNegative ? "negativeExpanded" : "expanded", false);
        });
    };

    self.onExtensionExpanded = function () {
        self.numberCtrl.jsplumbInstance.customRepaint().then(function () {
            setConnectionVisibility(true);
        });
    };

    self.onExtensionCollapsing = function () {
        setConnectionVisibility(false);
    };

    self.onExtensionExpanding = function (isNegative) {
        _.set(self.displayHelpers, isNegative ? "negativeExpanded" : "expanded", true);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        var sortInterval = null;
        var initPromise = $q.when(true);
        var sortableOptions = {
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
            }
        };

        self.loading.init = true;

        // set sortable options
        // for non negative rules
        self.rulesSortableOptions = angular.extend({
            update: function () {
                $timeout(function () {
                    // update extensions rules positions
                    angular.forEach(self.extension.rules, function (rule, index) {
                        rule.position = index + 1;
                    });

                    // call api to update all positions
                    self.extension.updateRulesPositions();
                });
            }
        }, sortableOptions);

        // for negative rules
        self.negativeRulesSortableOptions = angular.extend({
            update: function () {
                $timeout(function () {
                    // update extensions rules positions
                    angular.forEach(self.extension.negativeRules, function (rule, index) {
                        rule.position = index + 1;
                    });

                    // call api to update all positions
                    self.extension.updateRulesPositions(null, true);
                });
            }
        }, sortableOptions);

        self.ovhPabx = self.numberCtrl.number.feature;
        self.dialplan = self.dialplanCtrl.dialplan;
        self.uuid = _.uniqueId("ovhPabx_diaplan_extension_".concat(self.extension.extensionId));

        if (["DRAFT", "IN_CREATION"].indexOf(self.extension.status) === -1) {
            initPromise = $q.allSettled([
                self.extension.getRules(),
                self.extension.getScreenListConditions(),
                self.extension.getTimeConditions()
            ]);
        }

        return initPromise.finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
