angular.module("managerApp").controller("telephonyNumberOvhPabxMenuListCtrl", function ($q, $timeout, $filter, $translate, $translatePartialLoader, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        translations: false
    };

    self.askedMenuDelete = null;
    self.idPrefix = null;

    self.menus = {
        raw: null,
        paginated: null,
        sorted: null,
        orderBy: "name",
        orderDesc: false
    };

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getFilteredMenuList () {
        return _.filter(self.ovhPabx.menus, function (menu) {
            return menu.status !== "DRAFT";
        });
    }

    self.sortMenus = function () {
        self.menus.sorted = $filter("orderBy")(
            self.menus.raw,
            self.menus.orderBy,
            self.menus.orderDesc
        );
    };

    self.orderByName = function () {
        self.menus.orderDesc = !self.menus.orderDesc;
        self.sortMenus();
    };

    function isDisabledMenuUsedInEntry (menu) {
        return _.some(menu.entries, function (entry) {
            return entry.action === "menuSub" && (entry.actionParam === self.disableMenuId || isDisabledMenuUsedInEntry(self.ovhPabx.getMenu(entry.actionParam)));
        });
    }

    self.isMenuChoiceDisabled = function (menu) {
        return self.disableMenuId && (self.disableMenuId === menu.menuId || isDisabledMenuUsedInEntry(menu));
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onMenuDeleteConfirm = function (menu) {
        return menu.remove().then(function () {
            self.ovhPabx.removeMenu(menu);
            self.menus.raw = getFilteredMenuList();
            self.sortMenus();
            self.onSelectedMenuChanged(null);
        }).catch(function (error) {
            var errorTranslationKey = "telephony_number_feature_ovh_pabx_menu_list_delete_error";
            if (error.status === 403) {
                errorTranslationKey = "telephony_number_feature_ovh_pabx_menu_list_delete_error_used";
            }
            Toast.error([$translate.instant(errorTranslationKey), _.get(error, "data.message") || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.askedMenuDelete = null;
        });
    };

    self.onSelectedMenuChanged = function (menu) {
        if (self.onMenuSelected && _.isFunction(self.onMenuSelected())) {
            $timeout(function () {
                self.onMenuSelected()(menu);
            });
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Translations load  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx/menu/list");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    function getAllMenuEntries () {
        var entriesPromises = [];
        angular.forEach(self.ovhPabx.menus, function (menu) {
            entriesPromises.push(menu.getEntries());
        });

        return $q.allSettled(entriesPromises);
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        if (!self.numberCtrl && !self.ovhPabx) {
            throw new Error("telephonyNumberOvhPabxMenuList must have telephonyNumber component as parent or must have ovhPabx attribute specified");
        }

        self.loading.init = true;

        if (!self.ovhPabx) {
            self.ovhPabx = self.numberCtrl.number.feature;
        }

        if (!self.radioName) {
            self.radioName = "menuChoice";
        }
        self.idPrefix = _.kebabCase(self.radioName);

        return $q.all({
            translations: getTranslations(),
            menusEntries: getAllMenuEntries()
        }).then(function () {
            self.menus.raw = getFilteredMenuList();
            self.sortMenus();
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
