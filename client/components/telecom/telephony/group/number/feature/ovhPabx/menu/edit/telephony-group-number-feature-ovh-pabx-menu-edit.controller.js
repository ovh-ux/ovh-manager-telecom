angular.module("managerApp").controller("telephonyNumberOvhPabxMenuEditCtrl", function ($scope) {
    "use strict";

    var self = this;

    self.model = {
        soundFile: null
    };

    self.menuCtrl = null;
    self.ovhPabx = null;
    self.menu = null;
    self.uploadErrors = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasSoundFileError = function () {
        return self.uploadErrors.extension || self.uploadErrors.size || self.uploadErrors.exists || self.uploadErrors.name;
    };

    self.getSoundInfos = function (soundType) {
        return _.find(self.menuCtrl.ovhPabx.sounds, {
            soundId: _.get(self.menu, soundType)
        });
    };

    self.soundListModel = function (soundId) {
        if (arguments.length) {
            // setter
            if (self.menuCtrl.popoverStatus.rightPage === "greetSound") {
                return (self.menu.greetSound = soundId);
            }
            return (self.menu.invalidSound = soundId);

        }

        // getter
        return _.get(self.menu, self.menuCtrl.popoverStatus.rightPage);

    };

    /* ----------  FORM VALIDATION  ----------*/

    self.hasChange = function () {
        if (!self.menu) {
            return false;
        }
        return self.menu.status !== "DRAFT" ? self.menu.hasChange() : true;
    };

    self.isMenuValid = function () {
        return !!self.menu.greetSound;
    };

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    /* ----------  Popover footer buttons actions  ----------*/

    /**
     *  On popover cancel button click
     */
    self.onCancelBtnClick = function () {
        self.menuCtrl.popoverStatus.isOpen = false;
        self.menu.stopEdition(true);

        if (self.menu.status === "DRAFT") {
            self.menuCtrl.ovhPabx.removeMenu(self.menu);
            self.menuCtrl.menu = null;

            if (self.menuCtrl.menuEntry && self.menuCtrl.menuEntry.action === "menuSub" && self.menuCtrl.menuEntry.menuSub) {
                if (self.menuCtrl.menuEntry.status === "DRAFT") {
                    self.menuCtrl.ovhPabx.getMenu(self.menuCtrl.menuEntry.menuId).removeEntry(self.menuCtrl.menuEntry);
                } else {
                    self.menuCtrl.menuEntry.stopEdition(true, self.menuCtrl.menuEntry.menuSub.oldParent);
                }
                self.menuCtrl.menuEntry.stopEdition(true);
                self.menuCtrl.menuEntry.menuSub = null;
            } else if (self.menuCtrl.dialplanRule && self.menuCtrl.dialplanRule.action === "ivr" && self.menuCtrl.dialplanRule.ivrMenu) {
                if (self.menuCtrl.dialplanRule.status === "DRAFT") {
                    self.menuCtrl.extensionCtrl.extension.removeRule(self.menuCtrl.dialplanRule);
                } else {
                    self.menuCtrl.dialplanRule.stopEdition(true, self.menuCtrl.dialplanRule.ivrMenu.oldParent);
                }
                self.menuCtrl.dialplanRule.stopEdition(true);
                self.menuCtrl.dialplanRule.ivrMenu = null;
            }
        }
    };

    /**
     *  On popover validate button click
     */
    self.onValidateBtnClick = function () {
        var validatePromise = null;

        self.menuCtrl.popoverStatus.isOpen = false;

        if (self.menu.status === "DRAFT") {
            validatePromise = self.menu.create();
        } else {
            validatePromise = self.menu.save();
        }

        return validatePromise.then(function () {
            if (self.menuCtrl.menuEntry && self.menuCtrl.menuEntry.action === "menuSub" && self.menuCtrl.menuEntry.menuSub) {
                // save menu entry if menu entry
                self.menuCtrl.menuEntry.actionParam = self.menu.menuId;
                return self.menuCtrl.menuEntry.status === "DRAFT" ? self.menuCtrl.menuEntry.create() : self.menuCtrl.menuEntry.save();
            } else if (self.menuCtrl.dialplanRule && self.menuCtrl.dialplanRule.action === "ivr" && self.menuCtrl.dialplanRule.ivrMenu) {
                // save dialplan extension rule
                self.menuCtrl.dialplanRule.actionParam = self.menu.menuId;
                return self.menuCtrl.dialplanRule.status === "DRAFT" ? self.menuCtrl.dialplanRule.create() : self.menuCtrl.dialplanRule.save();
            }
            return null;
        }).then(function () {
            self.menu.stopEdition();
        });
    };

    /* ----------  Sound file selection  ----------*/

    self.onSoundChoiceButtonClick = function (soundType) {
        self.menuCtrl.popoverStatus.move = true;
        self.menuCtrl.popoverStatus.rightPage = soundType;
    };

    self.onSoundSelected = function (sound) {
        self.menuCtrl.popoverStatus.move = false;
        if (self.menuCtrl.popoverStatus.rightPage === "greetSound") {
            self.menu.greetSound = sound.soundId;
        } else {
            self.menu.invalidSound = sound.soundId;
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.menuCtrl = $scope.$parent.$ctrl;

        // set menu to edit
        self.menu = self.menuCtrl.menu;

        // start menu edition
        self.menu.startEdition();
    };

    /* -----  End of INITIALIZATION  ------*/

});
