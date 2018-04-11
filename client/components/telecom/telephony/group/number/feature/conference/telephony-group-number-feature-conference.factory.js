/**
 *  This factory manages the conference feature of a number.
 *  This manages the conference of /telephony/{billingAccount}/number API.
 */
angular.module("managerApp").factory("TelephonyGroupNumberConference", function ($q, $timeout, TelephonyGroupNumberConferenceParticipant, TelephonyMediator, OvhApiTelephony, OvhApiMe, voipServiceTask) {
    "use strict";

    var settingsAttributes = ["featureType", "pin", "announceFile", "reportEmail",
        "reportStatus", "whiteLabelReport", "language", "recordStatus",
        "eventsChannel", "anonymousRejection", "announceFilename",
        "enterMuted"
    ];

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupNumberConference (featureOptionsParam) {
        var featureOptions = featureOptionsParam;

        // check for mandatory options
        if (!featureOptions) {
            featureOptions = {};
        }

        // check mandatory fields
        if (!featureOptions.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupNumberConference");
        }

        if (!featureOptions.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupNumberConference");
        }

        if (!featureOptions.featureType) {
            throw new Error("featureType option must be specified when creating a new TelephonyGroupNumberConference");
        }

        // set mandatory attributes
        this.billingAccount = featureOptions.billingAccount;
        this.serviceName = featureOptions.serviceName;
        this.featureType = featureOptions.featureType;

        // from API
        this.locked = false;
        this.membersCount = null;
        this.dateStart = null;

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.participants = [];

        // settings
        this.pin = null;
        this.announceFile = false;
        this.reportEmail = null;
        this.reportStatus = null;
        this.whiteLabelReport = false;
        this.language = null;
        this.recordStatus = false;
        this.eventsChannel = null;
        this.anonymousRejection = false;
        this.announceFilename = false;
        this.enterMuted = false;

        // web access
        this.webAccess = {
            read: null,
            write: null
        };

        // set feature options
        this.setInfos(featureOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupNumberConference.prototype.setInfos = function (featureOptionsParam) {
        var self = this;
        var featureOptions = featureOptionsParam;

        if (!featureOptions) {
            featureOptions = {};
        }

        self.locked = _.get(featureOptions, "locked", false);
        self.membersCount = _.get(featureOptions, "membersCount", null);
        self.dateStart = _.get(featureOptions, "dateStart", null);

        return self;
    };

    TelephonyGroupNumberConference.prototype.setSettings = function (featureSettingsParam) {
        var self = this;
        var promise = {};
        var featureSettings = featureSettingsParam;

        if (!featureSettings) {
            featureSettings = {};
        }

        if (featureSettings.announceFilename) {
            promise.announceFilenameLabel = OvhApiMe.Document().v6().get({
                id: featureSettings.announceFilename
            }).$promise.then(function (doc) {
                return doc.name;
            });
        }

        return $q.all(promise).then(function (result) {
            _.assign(self, _.pick(featureSettings, settingsAttributes), result);
            return self;
        });
    };

    TelephonyGroupNumberConference.prototype.setWebAccess = function (featureWebAccessParam) {
        var self = this;
        var featureWebAccess = featureWebAccessParam;

        if (!featureWebAccess) {
            featureWebAccess = [];
        }

        self.webAccess.read = _.find(featureWebAccess, { type: "read" });
        self.webAccess.write = _.find(featureWebAccess, { type: "write" });

        return self;
    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroupNumberConference.prototype.getInfos = function () {
        var self = this;

        return OvhApiTelephony.Conference().v6().informations({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (infos) {
            return self.setInfos(infos).getParticipants();
        }, function (error) {
            if (error.status === 404) {
                // this means there is nobody in the conference
                // reset participant list
                self.participants = [];

                // reset informations
                return self.setInfos({
                    locked: false,
                    dateStart: null
                });
            }
            return $q.reject(error);

        });
    };

    TelephonyGroupNumberConference.prototype.getParticipants = function () {
        var self = this;

        return OvhApiTelephony.Conference().Participants().Aapi().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (participants) {
            return self.updateParticipantList(_.chain(participants).map("value").filter(null).value());
        });
    };

    TelephonyGroupNumberConference.prototype.save = function () {
        var self = this;
        var settings = _.pick(self, settingsAttributes);

        if (_.isEmpty(settings.pin)) {
            settings.pin = 0;
        }

        return OvhApiTelephony.Conference().v6().updateSettings({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, _.omit(settings, ["featureType", "eventsChannel", "announceFilename"])).$promise.then(function () {
            return self;
        });
    };

    TelephonyGroupNumberConference.prototype.lock = function () {
        var self = this;

        return OvhApiTelephony.Conference().v6().lock({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {}).$promise;
    };

    TelephonyGroupNumberConference.prototype.unlock = function () {
        var self = this;

        return OvhApiTelephony.Conference().v6().unlock({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {}).$promise;
    };

    TelephonyGroupNumberConference.prototype.getSettings = function () {
        var self = this;

        return OvhApiTelephony.Conference().v6().settings({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (settings) {
            return self.setSettings(settings);
        });
    };

    TelephonyGroupNumberConference.prototype.getWebAccess = function () {
        var self = this;

        return OvhApiTelephony.Conference().WebAccess().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (ids) {
            return $q.all(_.map(ids, function (id) {
                return OvhApiTelephony.Conference().WebAccess().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    id: id
                }).$promise;
            })).then(function (webAccess) {
                self.setWebAccess(webAccess);
            });
        });
    };

    TelephonyGroupNumberConference.prototype.generateWebAccess = function () {
        var self = this;

        return TelephonyMediator.getApiModelEnum("telephony.ConferenceWebAccessTypeEnum").then(function (accessType) {
            return $q.all(_.map(accessType, function (type) {
                return OvhApiTelephony.Conference().WebAccess().v6().create({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName
                }, {
                    type: type
                }).$promise;
            })).then(function () {
                return self.getWebAccess();
            });
        });
    };

    TelephonyGroupNumberConference.prototype.deleteWebAccess = function () {
        var self = this;
        var ids = [].concat(_.get(self.webAccess, "read.id"), _.get(self.webAccess, "write.id"));

        return $q.all(_.map(_.chain(ids).compact().value(), function (id) {
            return OvhApiTelephony.Conference().WebAccess().v6().remove({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName,
                id: id
            }).$promise;
        })).then(function () {
            self.webAccess = {
                read: null,
                write: null
            };
        });
    };

    TelephonyGroupNumberConference.prototype.announceUpload = function (file) {
        var self = this;

        return OvhApiMe.Document().v6().upload(file.name, file).then(function (doc) {
            return OvhApiTelephony.Conference().v6().announceUpload({
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }, {
                documentId: doc.id
            }).$promise.then(function (task) {
                return voipServiceTask.startPolling(self.billingAccount, self.serviceName, task.taskId, {
                    namespace: "announceUpload_" + self.serviceName,
                    interval: 1000,
                    retryMaxAttempts: 0
                }).catch(function (err) {
                    if (err.status === 404) {
                        // add some delay to ensure we get the sound from api when refreshing
                        return $timeout(function () {
                            return $q.when(true);
                        }, 2000);
                    }
                    return $q.reject(err);

                });
            });
        });
    };

    /* ----------  PARTICIPATNS  ----------*/

    TelephonyGroupNumberConference.prototype.updateParticipantList = function (participantsList) {
        var self = this;
        var curParticipantIds = _.map(self.participants, "id");
        var participantsListIds = _.map(participantsList, "id");
        var participantsIdsToRemove = _.difference(curParticipantIds, participantsListIds);
        var participantsIdsToAddOrUpdate = _.difference(participantsListIds, participantsIdsToRemove);

        // remove participants
        angular.forEach(participantsIdsToRemove, function (id) {
            _.remove(self.participants, {
                id: id
            });
        });

        // add participants
        angular.forEach(participantsIdsToAddOrUpdate, function (id) {
            self.addParticipant(_.find(participantsList, {
                id: id
            }));
        });

        return self;
    };

    TelephonyGroupNumberConference.prototype.addParticipant = function (participantOptions) {
        var self = this;
        var connectedParticipant = _.find(self.participants, {
            id: participantOptions.id
        });

        if (!connectedParticipant) {
            connectedParticipant = new TelephonyGroupNumberConferenceParticipant(angular.extend(participantOptions, {
                billingAccount: self.billingAccount,
                serviceName: self.serviceName
            }));
            self.participants.push(connectedParticipant);
        } else {
            connectedParticipant.setInfos(participantOptions);
        }

        return connectedParticipant;
    };

    TelephonyGroupNumberConference.prototype.muteAllParticipants = function () {
        var self = this;

        return $q.allSettled(_.map(self.participants, function (participant) {
            return participant.mute();
        }));
    };

    TelephonyGroupNumberConference.prototype.unmuteAllParticipants = function () {
        var self = this;

        return $q.allSettled(_.map(self.participants, function (participant) {
            return participant.unmute();
        }));
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupNumberConference.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;
        self.saveForEdition = _.assign({}, _.pick(self, settingsAttributes));

        return self;
    };

    TelephonyGroupNumberConference.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            _.assign(self, _.pick(self.saveForEdition, settingsAttributes));
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupNumberConference.prototype.hasChange = function () {
        var self = this;

        if (!self.inEdition || !self.saveForEdition) {
            return false;
        }

        return self.inEdition && !angular.equals(
            _.pick(self.saveForEdition, settingsAttributes),
            _.pick(self, settingsAttributes)
        );
    };

    /* ----------  HELPERS  ----------*/

    TelephonyGroupNumberConference.prototype.inPendingState = function () {
        return true;
    };

    TelephonyGroupNumberConference.prototype.hasParticipants = function () {
        var self = this;

        return self.participants.length > 0;
    };

    /* ----------  INITIALIZATION  ----------*/

    TelephonyGroupNumberConference.prototype.init = function () {
        var self = this;

        return OvhApiTelephony.Conference().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function () {
            return self.getInfos();
        });
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupNumberConference;

});
