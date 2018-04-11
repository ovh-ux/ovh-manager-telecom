angular.module("managerApp")
    .controller("FreeFaxNotificationsCtrl", function ($stateParams, OvhApiFreeFax, Toast, $translate, $q, FREEFAX, FreeFaxNotificationObject) {
        "use strict";
        var self = this;

        /**
         * submit / unsubmit with keys
         */
        this.watchKey = function ($event, notif, valid) {
            if ($event.keyCode === 13 && valid) {
                self.update(notif);
            }
            if ($event.keyCode === 27) {
                this.cancel(notif);
            }
        };

        /**
         * Check if email address is unique
         * @param                    {String} val        Email value to Check
         * @param                     {Array} collection List of notifications (FreeFaxNotificationObject)
         * @param {FreeFaxNotificationObject} current    Current object
         * @return {Boolean}
         */
        this.isUnique = function (val, collection, current) {
            var other = _.filter(collection, function (elt) {
                return elt.email !== current.email;
            });
            return !_.some(other, { email: val });
        };

        /**
         * Update all notifications
         * @param {FreeFaxNotificationObject} notif Current notification (optional)
         * @return {Promise}
         */
        this.update = function (notifParam) {
            var notif = notifParam || {};
            notif.busy = true;
            var notifications = _.filter(this.notifications, function (elt) {
                return elt.email !== notif.email;
            });
            notifications.push(notif.tempValue);
            return OvhApiFreeFax.Aapi().notificationsUpdate(
                {
                    serviceName: $stateParams.serviceName
                }, {
                    notifications: notifications
                }
            ).$promise.then(function (data) {
                if (notif.accept) {
                    notif.accept();
                }
                Toast.success($translate.instant("freefax_notif_save_success"));
                return data;
            }).catch(
                function (err) {
                    Toast.error($translate.instant("freefax_notif_save_error"));
                    return $q.reject(err);
                }
            ).finally(function () {
                notif.busy = false;
            });
        };

        /**
         * Cancel the edition of a BDHCP
         * @param {FreeFaxNotificationObject} notif Notification
         */
        this.cancel = function (notif) {
            if (!notif.cancel()) {
                _.remove(self.notifications, notif);
            }
        };

        /**
         * Add a notification in edition mode
         */
        this.add = function () {
            _.forEach(this.notifications, function (notif) {
                if (notif.editMode) {
                    self.cancel(notif);
                }
            });
            var newNotif = new FreeFaxNotificationObject();
            self.notifications.push(newNotif);
            newNotif.edit();
        };

        /**
         * Destroy a notification
         * @return {Promise}
         */
        this.destroy = function (notif) {
            var removed = _.remove(this.notifications, { email: notif.email });
            return this.update().then(function (data) {
                return data;
            }).catch(function (err) {
                self.notifications.push(removed[0]);
                return $q.reject(err);
            });
        };

        /**
         * Get notifications
         * @return {Promise}
         */
        function getNotifications () {
            OvhApiFreeFax.Aapi().notifications({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (notificationList) {
                self.notifications = notificationList.map(function (notif) {
                    return new FreeFaxNotificationObject({
                        email: notif.email,
                        type: notif.type,
                        source: notif.source,
                        inApi: true
                    });
                });
                return self.notifications;
            }).catch(function (err) {
                self.notifications = [];
                Toast.error($translate.instant("freefax_notif_read_error"));
                return $q.reject(err);
            });
        }

        /**
         * Get choice type for voicemail notification (attachment, simple, ...)
         * @return {Promise}
         */
        function getTypeChoices () {
            return OvhApiFreeFax.v6().schema().$promise.then(function (data) {
                self.typeChoices = _.map(data.models["telephony.ServiceVoicemailMailOptionEnum"].enum, function (value) {
                    return {
                        value: value,
                        label: $translate.instant("freefax_notification_type_" + value)
                    };
                });
                return self.typeChoices;
            }).catch(function (err) {
                return $q.reject(err);
            });
        }

        /**
         * Constructor initialization
         */
        function init () {
            self.typeChoices = [];

            self.sourceChoices = _.map(["fax", "voicemail", "both"], function (elt) {
                return {
                    value: elt,
                    label: $translate.instant("freefax_notification_source_" + elt)
                };
            });

            self.maxNotifications = FREEFAX.maxNotifications;

            self.notifications = undefined;

            self.serviceName = $stateParams.serviceName;

            getTypeChoices().then(getNotifications).catch(function (err) {
                self.notifications = [];
                return $q.reject(err);
            });
        }

        init();
    });
