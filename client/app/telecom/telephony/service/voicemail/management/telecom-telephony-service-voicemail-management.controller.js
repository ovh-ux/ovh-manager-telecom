angular.module("managerApp").controller("TelecomTelephonyServiceVoicemailManagementCtrl", function ($scope, $stateParams, $q, $translate, $timeout, $filter, $document, $window, ToastError, OvhApiTelephony) {
    "use strict";

    var self = this;

    function fetchMessageList () {
        return OvhApiTelephony.Voicemail().Directories().v6().query({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (ids) {
            // max api batch size is 50
            return $q.all(_.map(_.chunk(ids, 50), function (chunkIds) {
                return OvhApiTelephony.Voicemail().Directories().v6().getBatch({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName,
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                return _.map(result, function (message) {
                    message.durationAsDate = new Date(message.duration * 1000);
                    message.isPlaying = false;
                    return message;
                });
            });
        });
    }

    function init () {

        self.messages = {
            raw: null,
            sorted: null,
            paginated: null,
            selected: null,
            orderBy: "creationDatetime",
            orderDesc: false,
            playing: null,
            isLoading: false,
            isDeleting: false
        };

        var audioElement = $document.find("#voicemailAudio")[0];
        audioElement.addEventListener("ended", function () {
            $timeout(function () {
                self.messages.playing = null;
            });
        });

        self.messages.isLoading = true;
        fetchMessageList().then(function (messages) {
            self.messages.raw = angular.copy(messages);
            self.sortMessages();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.messages.isLoading = false;
        });
    }

    this.getSelection = function () {
        return _.filter(self.messages.raw, function (message) {
            return message && self.messages.selected && self.messages.selected[message.id];
        });
    };

    this.sortMessages = function () {
        self.messages.sorted = $filter("orderBy")(
            self.messages.raw,
            self.messages.orderBy,
            self.messages.orderDesc
        );
    };

    this.fetchMessageFile = function (message) {
        /**
         * Fetching a file is a little bit tricky because if file state
         * is not "done" the url will redirect to a 404...
         * So we have to poll the query until the file state is "done"
         * or until the call fails.
         */
        var tryDownload = function () {
            return OvhApiTelephony.Voicemail().Directories().v6().download({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                id: message.id
            }).$promise.then(function (info) {
                if (info.status === "error") {
                    return $q.reject({
                        statusText: "Unable to download message"
                    });
                } else if (info.status === "done") {
                    return $q.when(info);
                }

                // file is not ready to download, just retry
                return $timeout(function () {
                    OvhApiTelephony.Voicemail().Directories().v6().resetCache();
                    OvhApiTelephony.Voicemail().Directories().v6().resetQueryCache();
                    return tryDownload();
                }, 1000);
            });
        };
        return tryDownload();
    };

    this.listenMessage = function (message) {
        if (self.messages.playing === message) {
            self.messages.playing = null;
            var audioElement = $document.find("#voicemailAudio")[0];
            audioElement.pause();
        } else {
            if (self.messages.playing) {
                self.messages.playing.pendingListen = false;
            }
            message.pendingListen = true;
            return self.fetchMessageFile(message).then(function (info) {
                var audioElt = $document.find("#voicemailAudio")[0];
                self.messages.playing = message;
                audioElt.src = info.url;
                audioElt.load();
                audioElt.play();
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                message.pendingListen = false;
            });
        }
        return $q.when(null);
    };

    this.downloadMessage = function (message) {
        message.pendingDownload = true;
        return self.fetchMessageFile(message).then(function (info) {
            $window.location.href = info.url;
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            message.pendingDownload = false;
        });
    };

    this.deleteMessages = function (messageList) {
        var queries = messageList.map(function (message) {
            return OvhApiTelephony.Voicemail().Directories().v6().delete({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                id: message.id
            }).$promise;
        });
        self.messages.isDeleting = true;
        queries.push($timeout(angular.noop, 1000)); // avoid clipping
        return $q.all(queries).then(function () {
            return fetchMessageList().then(function (messages) {
                self.messages.raw = angular.copy(messages);
                self.sortMessages();
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.messages.isDeleting = false;
        });
    };

    this.deleteMessage = function (message) {
        message.isDeleting = true;
        return self.deleteMessages([message]).then(function () {
            message.isDeleting = false;
        });
    };

    this.deleteSelectedMessages = function () {
        return self.deleteMessages(self.getSelection());
    };

    this.refresh = function () {
        self.messages.isLoading = true;
        OvhApiTelephony.Voicemail().Directories().v6().resetCache();
        OvhApiTelephony.Voicemail().Directories().v6().resetQueryCache();
        return $q.all({
            noop: $timeout(angular.noop, 1000), // avoid clipping
            messages: fetchMessageList()
        }).then(function (result) {
            self.messages.raw = angular.copy(result.messages);
            self.sortMessages();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.messages.isLoading = false;
        });
    };

    this.orderBy = function (by) {
        if (self.messages.orderBy === by) {
            self.messages.orderDesc = !self.messages.orderDesc;
        } else {
            self.messages.orderBy = by;
        }
        self.sortMessages();
    };

    init();
});
