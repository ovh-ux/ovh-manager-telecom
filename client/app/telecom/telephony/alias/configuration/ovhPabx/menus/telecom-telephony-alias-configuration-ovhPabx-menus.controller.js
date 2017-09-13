angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationOvhPabxMenusCtrl", function ($scope, $q, $stateParams, $translate, $timeout, TelephonyMediator, Toast, jsPlumbService, TELPHONY_NUMBER_JSPLUMB_INSTANCE_OPTIONS) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.model = {
        selectedMenu: null
    };

    self.menu = null;
    self.jsPlumbInstanceOptions = TELPHONY_NUMBER_JSPLUMB_INSTANCE_OPTIONS;
    self.jsPlumbInstance = null;

    /*= =============================
    =            EVENTS            =
    ==============================*/

    function manageMenuDisplayChange (menu) {
        if (self.menu) {
            if (self.menu.status === "DRAFT") {
                self.number.feature.removeMenu(self.menu);
            }
            self.menu.stopEdition(true);
        }
        self.menu = null;
        return $timeout(function () {
            // timeout to force menu redraw
            self.menu = menu;
        });
    }

    self.onAddMenuBtnClick = function () {
        manageMenuDisplayChange(self.number.feature.addMenu({
            name: $translate.instant("telephony_alias_ovh_pabx_menus_new_menu_name", {
                index: self.number.feature.menus.length + 1
            }),
            status: "DRAFT"
        })).then(function () {
            self.model.selectedMenu = null;
            if (self.jsPlumbInstance) {
                self.jsPlumbInstance.customRepaint();
            }
        });
    };

    self.onMenuSelected = function (menu) {
        manageMenuDisplayChange(menu ? self.number.feature.getMenu(menu.menuId) : null);
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        var initPromises;

        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                if (self.number.getFeatureFamily() === "ovhPabx") {
                    initPromises = {
                        menus: self.number.feature.getMenus(),
                        sounds: self.number.feature.getSounds(),
                        tts: self.number.feature.getTts(),
                        jsplumb: jsPlumbService.initJsPlumb()
                    };

                    if (self.number.feature.featureType !== "cloudHunting") {
                        initPromises.queues = self.number.feature.getQueues();
                    }

                    return $q.all();
                }
                return null;
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /**
     *  What to do on controller destroy ?
     *  Remove draft menu from menu list
     */
    $scope.$on("$destroy", function () {
        if (self.menu) {
            self.number.feature.removeMenu(self.menu);
        }
    });

    /* -----  End of INITIALIZATION  ------*/

});
