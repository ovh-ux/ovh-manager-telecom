angular.module("managerApp").controller("OverTheBoxRemoteCtrl", function ($stateParams, $translate, $scope, $q, URLS, OVER_THE_BOX, OVERTHEBOX_REMOTE_STATUS, OvhApiOverTheBox, ToastError, Toast, IpAddress) {
    "use strict";

    var self = this;

    this.filter = {
        perPage: 10
    };

    this.remoteStatus = OVERTHEBOX_REMOTE_STATUS;

    this.validator = validator;
    this.publicKeyHelperUrl = URLS.keyGenHelp;
    this.pickerOpened = false;
    this.maxRemotes = OVER_THE_BOX.maxRemotes;

    /**
     * Initialize the controller
     */
    function init () {
        self.paginatedRemotes = [];
        self.remotes = [];
        self.newRemote = {
            exposedPort: 443
        };
        self.datepickerOptions = {
            minDate: moment().add(1, "days").toDate()
        };
        self.loading = true;
        return $q.all([
            /* Load all remotes */
            OvhApiOverTheBox.Aapi().remoteAccesses({
                serviceName: $stateParams.serviceName
            }, null).$promise.then(
                function (remotes) {
                    self.remotes = remotes;
                },
                function (err) {
                    self.remotes = [];
                    return new ToastError(err);
                }
            ).finally(
                function () {
                    self.loading = false;
                }
            ),

            /* Create tho poller */
            OvhApiOverTheBox.Aapi().poll($scope, {
                serviceName: $stateParams.serviceName
            }).then(
                function (remotes) {
                    self.remotes = remotes;
                },
                ToastError,
                function (remotes) {
                    self.remotes = remotes;
                }
            )
        ]);
    }

    /**
     * Update remote data
     * @param newRemote
     * @param oldRemote
     */
    function updateRemote (newRemote, oldRemote) {
        self.remotes = self.remotes.map(function (remote) {
            return remote.remoteAccessId === oldRemote.remoteAccessId ? newRemote : remote;
        });
        self.paginatedRemotes = self.paginatedRemotes.map(function (remote) {
            return remote.remoteAccessId === oldRemote.remoteAccessId ? newRemote : remote;
        });
    }

    this.isIpValid = function (ip) {
        if (!ip) {
            return true;
        }
        return IpAddress.isValidIp(ip);
    };

    this.openDatePicker = function (event) {
        self.pickerOpened = true;
        event.stopPropagation();
    };

    /**
     * Create a new remote
     */
    this.addRemote = function () {
        self.adding = true;
        var formData = angular.copy(this.newRemote);
        if (this.newRemote.expirationDate) {
            formData.expirationDate = moment(this.newRemote.expirationDate).toISOString();
        }
        return OvhApiOverTheBox.Aapi().createAndAuthorize({
            serviceName: $stateParams.serviceName
        }, formData).$promise.then(
            function () {
                init();
                self.addForm = false;
                Toast.success($translate.instant("overTheBox_remote_element_added"));
            }
        ).catch(function (err) {
            if (err && err.data === "Impossible to create a remote access, your device hasn't contacted us for more than 10 minutes") {
                Toast.error($translate.instant("overTheBox_remote_error_no_contact"));
            } else {
                Toast.error($translate.instant("overTheBox_remote_error_unknown"));
            }
            return $q.reject(err);
        }).finally(function () {
            self.adding = false;
        }
        );
    };

    /**
     * Validate that the date is in the future
     * @param {Date} when Date to compare
     * @return {Boolean}
     */
    this.isInFuture = function (when) {
        return !when || moment(when).isAfter(new Date());
    };

    /**
     * Connection information to display
     * @param remote
     * @returns {string}
     */
    this.getSshConnectionHelp = function (remote) {
        return remote && remote.connectionInfos && remote.connectionInfos.ip ?
            "ssh -p " + remote.connectionInfos.port + " root@" + remote.connectionInfos.ip :
            "";
    };

    /**
     * Connection information to display
     * @param remote
     * @returns {string}
     */
    this.getHttpConnectionHelp = function (remote) {
        return remote && remote.connectionInfos && remote.connectionInfos.port ?
            "https://" + remote.connectionInfos.ip + ":" + remote.connectionInfos.port + "/" :
            "";
    };

    /**
     * Authorize a remote (used when support created a remote)
     * @param remote
     */
    this.authorize = function (remote) {
        remote.busy = true;
        return OvhApiOverTheBox.v6().authorizeRemote(
            {
                serviceName: $stateParams.serviceName,
                remoteAccessId: remote.remoteAccessId
            },
            null).$promise.then(
            function () {
                return self.reloadRemote(remote);
            }, function (err) {
                remote.busy = false;
                return new ToastError(err);
            });
    };

    /**
     * Reload one remote
     * @param remote
     * @returns {*}
     */
    this.reloadRemote = function (remote) {
        remote.busy = true;
        return OvhApiOverTheBox.v6().loadRemote({
            serviceName: $stateParams.serviceName,
            remoteAccessId: remote.remoteAccessId
        }, null).$promise.then(function (reloadedRemote) {
            updateRemote(reloadedRemote, remote);
            if (reloadedRemote.accepted) {
                if (reloadedRemote.status !== "toDelete") {
                    Toast.success($translate.instant("overTheBox_remote_authorized", { port: reloadedRemote.exposedPort }));
                }
            } else {
                Toast.error($translate.instant("overTheBox_remote_authorized_failed", { port: reloadedRemote.exposedPort }));
            }
        }, ToastError).finally(function () {
            remote.busy = false;
        });
    };

    /**
     * Delete a remote
     * @param remote
     */
    this.remove = function (remote) {
        remote.busy = true;
        return OvhApiOverTheBox.v6().deleteRemote({
            serviceName: $stateParams.serviceName,
            remoteAccessId: remote.remoteAccessId
        }, null).$promise.then(function () {
            Toast.success($translate.instant("overTheBox_remote_element_deleted"));
            self.reloadRemote(remote);
        }, ToastError
        ).finally(function () {
            remote.busy = false;
        });
    };

    init();
});
