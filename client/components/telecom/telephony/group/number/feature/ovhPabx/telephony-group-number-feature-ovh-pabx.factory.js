angular.module("managerApp").factory("TelephonyGroupNumberOvhPabx", function ($q, VoipScheduler, TelephonyGroupNumberOvhPabxDialplan, TelephonyGroupNumberOvhPabxSound,
                                                                              TelephonyGroupNumberOvhPabxMenu, TelephonyGroupNumberOvhPabxTts, OvhApiTelephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberOvhPabx (featureOptionsParam) {
        var featureOptions = featureOptionsParam;

        // check for mandatory options
        if (!featureOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupNumberOvhPabx");
        } else {
            if (!featureOptions.billingAccount) {
                throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberOvhPabx");
            }

            if (!featureOptions.serviceName) {
                throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberOvhPabx");
            }

            if (!featureOptions.featureType) {
                throw new Error("featureType option must be specified when creating a new TelephonyGroupNumberOvhPabx");
            }
        }

        if (!featureOptions) {
            featureOptions = {};
        }

        // set mandatory attributes
        this.billingAccount = featureOptions.billingAccount;
        this.serviceName = featureOptions.serviceName;
        this.featureType = featureOptions.featureType;

        // set feature options
        this.setOptions(featureOptions);

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.scheduler = null;
        this.dialplans = [];
        this.sounds = [];
        this.menus = [];
        this.queues = [];
        this.tts = [];
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.setOptions = function () {
        var self = this;

        return self;
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.isCcs = function () {
        var self = this;

        return self.featureType === "contactCenterSolutionExpert";
    };

    TelephonyGroupNumberOvhPabx.prototype.isTtsAvailable = function () {
        var self = this;

        return self.isCcs();
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = {
            featureType: angular.copy(self.featureType)
        };

        return self;
    };

    TelephonyGroupNumberOvhPabx.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.featureType = angular.copy(self.saveForEdition.featureType);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberOvhPabx.prototype.hasChange = function (attr) {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        if (attr) {
            return !_.isEqual(_.get(self.saveForEdition, attr), _.get(self, attr));
        }
        return self.hasChange("featureType");
    };


    /* ----------  SCHEDULER  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.getScheduler = function () {
        var self = this;

        if (!self.scheduler) {
            self.scheduler = new VoipScheduler({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            });
        }

        return self.scheduler.get();
    };

    /* ----------  DIALPLAN  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.getDialplans = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Dialplan().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (dialplanIds) {
            return $q.all(_.map(_.chunk(dialplanIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Dialplan().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    dialplanId: chunkIds
                }).$promise.then(function (resources) {
                    angular.forEach(_.map(resources, "value"), function (dialplanOptions) {
                        self.addDialplan(dialplanOptions);
                    });
                    return self;
                });
            }));
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.addDialplan = function (dialplanOptions) {
        var self = this;
        var dialplan = _.find(self.dialplans, {
            dialplanId: dialplanOptions.dialplanId
        });

        if (dialplan) {
            dialplan.setInfos(dialplanOptions);
        } else {
            dialplan = new TelephonyGroupNumberOvhPabxDialplan(angular.extend(dialplanOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }));
            self.dialplans.push(dialplan);
        }

        return dialplan;
    };

    /**
     *  Remove dialplan from list without calling API.
     */
    TelephonyGroupNumberOvhPabx.prototype.removeDialplan = function (dialplan) {
        var self = this;

        _.remove(self.dialplans, dialplan);

        return self;
    };

    /* ----------  SOUNDS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.getSound = function (soundId) {
        var self = this;

        return _.find(self.sounds, {
            soundId: soundId
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.getSounds = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Sound().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (soundIds) {
            return $q.all(_.map(_.chunk(soundIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Sound().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    soundId: chunkIds
                }).$promise.then(function (resources) {
                    _.chain(resources).filter(function (soundOptions) {
                        return soundOptions.value !== null;
                    }).map("value").value().forEach(function (soundOptions) {
                        // try to find sound with same name and without id and set new soundId (these sounds are freshly uploaded)
                        var sameFileFromName = _.find(self.sounds, {
                            name: soundOptions.name
                        });
                        if (sameFileFromName && !sameFileFromName.soundId) {
                            sameFileFromName.soundId = soundOptions.soundId;
                        }
                        self.addSound(soundOptions);
                    });
                    return self;
                });
            }));
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.addSound = function (soundOptions) {
        var self = this;
        var sound = null;

        if (soundOptions.soundId) {
            sound = _.find(self.sounds, {
                soundId: soundOptions.soundId
            });
        }

        if (sound) {
            sound.setInfos(soundOptions);
        } else {
            sound = new TelephonyGroupNumberOvhPabxSound(angular.extend(soundOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }));
            self.sounds.push(sound);
        }

        return sound;
    };

    /**
     *  Remove sound from list.
     */
    TelephonyGroupNumberOvhPabx.prototype.removeSound = function (sound) {
        var self = this;

        _.remove(self.sounds, sound);

        return self;
    };

    /* ----------  MENUS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.getMenu = function (menu) {
        var self = this;
        var menuId = menu.constructor.name === "TelephonyGroupNumberOvhPabxMenu" ? menu.id : menu;

        return _.find(self.menus, {
            menuId: menuId
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.getMenus = function (loadEntries) {
        var self = this;

        return OvhApiTelephony.OvhPabx().Menu().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (menuIds) {
            return $q.all(_.map(_.chunk(menuIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Menu().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    menuId: chunkIds
                }).$promise.then(function (resources) {
                    _.chain(resources).filter(function (menuOptions) {
                        return menuOptions.value !== null;
                    }).map("value").value().forEach(function (menuOptions) {
                        self.addMenu(menuOptions);
                    });
                    return self;
                });
            })).then(function () {
                var entriesPromises = [];

                // must we also load entries ?
                if (loadEntries) {
                    self.menus.forEach(function (menu) {
                        entriesPromises.push(menu.getEntries());
                    });
                    return $q.all(entriesPromises);
                }

                return self;
            });
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.addMenu = function (menuOptionsParam) {
        var self = this;
        var menu = null;
        var menuOptions = menuOptionsParam;

        if (!menuOptions) {
            menuOptions = {};
        }

        if (menuOptions.menuId) {
            menu = _.find(self.menus, {
                menuId: menuOptions.menuId
            });
        }

        if (menu) {
            menu.setInfos(menuOptions);
        } else {
            menu = new TelephonyGroupNumberOvhPabxMenu(angular.extend(menuOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }));
            self.menus.push(menu);
        }

        return menu;
    };

    /**
     *  Remove menu from list.
     */
    TelephonyGroupNumberOvhPabx.prototype.removeMenu = function (menu) {
        var self = this;

        _.remove(self.menus, menu);

        return self;
    };

    /* ----------  QUEUES  ----------*/

    /**
     *  TODO FOR QUEUES
     *  Set the same philosophy as menu and sounds.
     *  Create factory and add instance of the factory inside queues array.
     */

    TelephonyGroupNumberOvhPabx.prototype.getQueue = function (queueId) {
        var self = this;

        return _.find(self.queues, {
            queueId: queueId
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.getQueues = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (queueIds) {
            return $q.all(_.map(_.chunk(queueIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Hunting().Queue().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    queueId: chunkIds
                }).$promise.then(function (resources) {
                    self.queues = _.chain(resources).filter(function (queueOptions) {
                        return queueOptions.value !== null;
                    }).map(function (queueOptionsParam) {
                        var queueOptions = queueOptionsParam.value;
                        queueOptions.queueId = parseInt(queueOptions.queueId, 10);
                        return queueOptions;
                    }).value();
                    return self;
                });
            }));
        });
    };

    /* ----------  TTS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.getSingleTts = function (ttsId) {
        var self = this;

        return _.find(self.tts, {
            id: ttsId
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.getTts = function () {
        var self = this;

        return OvhApiTelephony.OvhPabx().Tts().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (ttsIds) {
            return $q.all(_.map(_.chunk(ttsIds, 50), function (chunkIds) {
                return OvhApiTelephony.OvhPabx().Tts().v6().getBatch({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    id: chunkIds
                }).$promise.then(function (resources) {
                    _.chain(resources).filter(function (ttsOptions) {
                        return ttsOptions.value !== null;
                    }).map("value").value().forEach(function (ttsOptions) {
                        self.addTts(ttsOptions);
                    });
                    return self;
                });
            }));
        });
    };

    TelephonyGroupNumberOvhPabx.prototype.addTts = function (ttsOptionsParam) {
        var self = this;
        var ttsOptions = ttsOptionsParam;
        var tts = null;

        if (!ttsOptions) {
            ttsOptions = {};
        }

        if (ttsOptions.id) {
            tts = _.find(self.tts, {
                id: ttsOptions.id
            });
        }

        if (tts) {
            tts.setOptions(ttsOptions);
        } else {
            tts = new TelephonyGroupNumberOvhPabxTts(angular.extend(ttsOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }));
            self.tts.push(tts);
        }

        return tts;
    };

    TelephonyGroupNumberOvhPabx.prototype.removeTts = function (tts) {
        var self = this;

        _.remove(self.tts, {
            id: tts.id
        });

        return self;
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.inPendingState = function () {
        return false;
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupNumberOvhPabx.prototype.init = function (resetCache) {
        var self = this;

        if (resetCache) {
            OvhApiTelephony.OvhPabx().resetCache();
        }

        return OvhApiTelephony.OvhPabx().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (featureOptions) {
            return self.setOptions(featureOptions);
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberOvhPabx;

});
