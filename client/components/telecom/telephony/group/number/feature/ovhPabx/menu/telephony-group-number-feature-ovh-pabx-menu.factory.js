angular.module("managerApp").factory("TelephonyGroupNumberOvhPabxMenu", function ($q, OvhApiTelephony, TelephonyGroupNumberOvhPabxMenuEntry) {
    "use strict";

    var allDtmfKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberOvhPabxMenu (menuOptionsParam) {
        var menuOptions = menuOptionsParam;

        if (!menuOptions) {
            menuOptions = {};
        }

        // check for mandatory options
        if (!menuOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberOvhPabxMenu");
        }

        if (!menuOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberOvhPabxMenu");
        }

        // set mandatory attributes
        this.billingAccount = menuOptions.billingAccount;
        this.serviceName = menuOptions.serviceName;

        // other attributes
        this.menuId = menuOptions.menuId || _.random(_.now());
        this.name = null;
        this.greetSound = null;
        this.greetSoundTts = null;
        this.invalidSound = null;
        this.invalidSoundTts = null;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.status = null;
        this.entries = [];

        // used to store the saved values of the parent (menuEntry or extensionRule)
        this.oldParent = menuOptions.oldParent;

        this.setInfos(menuOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    TelephonyGroupNumberOvhPabxMenu.prototype.setInfos = function (menuOptions) {
        var self = this;

        self.name = menuOptions.name || null;
        self.greetSound = menuOptions.greetSound || null;
        self.greetSoundTts = menuOptions.greetSoundTts || null;
        self.invalidSound = menuOptions.invalidSound || null;
        self.invalidSoundTts = menuOptions.invalidSoundTts || null;
        self.status = menuOptions.status || "OK";

        return self;
    };

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  API CALLS  ----------*/

    TelephonyGroupNumberOvhPabxMenu.prototype.create = function () {
        var self = this;

        self.status = "IN_CREATION";

        return OvhApiTelephony.OvhPabx().Menu().v6().create({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            greetSound: self.greetSound,
            greetSoundTts: self.greetSoundTts,
            invalidSound: self.invalidSound,
            invalidSoundTts: self.invalidSoundTts,
            name: self.name
        }).$promise.then(function (menuOptions) {
            self.menuId = menuOptions.menuId;
            self.status = "OK";
            return self;
        }, function (error) {
            self.status = "DRAFT";
            return $q.reject(error);
        });
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.save = function () {
        var self = this;

        self.status = "SAVING";

        return OvhApiTelephony.OvhPabx().Menu().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            menuId: self.menuId
        }, {
            greetSound: self.greetSound,
            greetSoundTts: self.greetSoundTts,
            invalidSound: self.invalidSound,
            invalidSoundTts: self.invalidSoundTts,
            name: self.name
        }).$promise.then(function () {
            return self;
        }).finally(function () {
            // in all case status is OK
            self.status = "OK";
        });
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.remove = function () {
        var self = this;

        self.status = "DELETING";

        return OvhApiTelephony.OvhPabx().Menu().v6().remove({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            menuId: self.menuId
        }).$promise.finally(function () {
            // in all case status is OK
            self.status = "OK";
        });
    };

    /* ----------  ENTRIES  ----------*/

    TelephonyGroupNumberOvhPabxMenu.prototype.getEntries = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Menu().Entry().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            menuId: self.menuId
        }).$promise.then(function (menuEntryIds) {
            return $q.all(_.map(_.chunk(menuEntryIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Menu().Entry().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    menuId: self.menuId,
                    entryId: chunkIds
                }).$promise.then(function (resources) {
                    angular.forEach(_.chain(resources).map("value").sortBy("position").value(), function (menuEntryOptions) {
                        self.addEntry(menuEntryOptions);
                    });
                    return self;
                });
            }));
        });
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.addEntry = function (menuEntryOptionsParam) {
        var self = this;
        var entry = null;
        var menuEntryOptions = menuEntryOptionsParam;

        if (!menuEntryOptions) {
            menuEntryOptions = {};
        }

        if (menuEntryOptions.entryId) {
            entry = _.find(self.entries, {
                entryId: menuEntryOptions.entryId
            });
        }

        if (entry) {
            if (entry.inEdition) {
                return entry;
            }
            entry.setInfos(menuEntryOptions);
        } else {
            entry = new TelephonyGroupNumberOvhPabxMenuEntry(angular.extend(menuEntryOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                menuId: self.menuId
            }));
            self.entries.push(entry);
        }

        return entry;
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.removeEntry = function (entry) {
        var self = this;

        _.remove(self.entries, entry);

        return self;
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.hasAvailableDtmfEntryKey = function () {
        var self = this;
        return !!self.getFirstAvailableDtmfEntryKey();
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.getFirstAvailableDtmfEntryKey = function () {
        var self = this;
        return _.first(_.difference(allDtmfKeys, _.map(self.entries, "dtmf")));
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.getAllDtmfEntryKeys = function () {
        return allDtmfKeys;
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberOvhPabxMenu.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = {
            name: angular.copy(self.name),
            greetSound: angular.copy(self.greetSound),
            greetSoundTts: angular.copy(self.greetSoundTts),
            invalidSound: angular.copy(self.invalidSound),
            invalidSoundTts: angular.copy(self.invalidSoundTts),
            status: angular.copy(self.status)
        };

        return self;
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.name = angular.copy(self.saveForEdition.name);
            self.greetSound = angular.copy(self.saveForEdition.greetSound);
            self.greetSoundTts = angular.copy(self.saveForEdition.greetSoundTts);
            self.invalidSound = angular.copy(self.saveForEdition.invalidSound);
            self.invalidSoundTts = angular.copy(self.saveForEdition.invalidSoundTts);
            self.status = angular.copy(self.saveForEdition.status);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberOvhPabxMenu.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
        }
        return self.hasChange("name") || self.hasChange("greetSound") || self.hasChange("invalidSound") || self.hasChange("greetSoundTts") || self.hasChange("invalidSoundTts");
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberOvhPabxMenu;

});
