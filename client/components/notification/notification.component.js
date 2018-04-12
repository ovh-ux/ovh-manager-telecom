angular.module("managerApp")
    .component("notificationList", {
        bindings: {
            ngModel: "=?",
            xdslService: "=",
            errorHandler: "&",
            onChange: "&"
        },
        controllerAs: "NotificationListCtrl",
        templateUrl: "components/notification/notification-list.html",
        controller: function ($scope, OvhApiSms, OvhApiXdslNotifications, NotificationElement) {
            "use strict";
            var self = this;

            this.loading = true;

            /**
                 * Add a new element in Edit mode
                 */
            this.addElement = function () {
                var notif = new NotificationElement(
                    {
                        frequency: self.frequencies[0].name,
                        type: self.types[0].name,
                        xdslService: self.xdslService,
                        smsAccount: self.accounts.length === 1 ? self.accounts[0] : null,
                        id: new Date().getTime()
                    },
                    true
                );
                self.ngModel.unshift(notif);
                self.sort = null;
            };

            /**
                 * Sort the list of notifications
                 * @param {String}  fieldName  Name of the sorting field
                 * @param {boolean} descending If true, descending
                 */
            this.sortElements = function (sort/* fieldName, descending*/) {
                self.ngModel.sort(function (a, b) {
                    var comp1;
                    var comp2;

                    switch (sort.fieldName) {
                    case "contact":
                        comp1 = a.phone || a.email;
                        comp2 = b.phone || b.email;
                        break;
                    case "frequency":
                        var mapping = {
                            once: 0,
                            "5m": 1,
                            "1h": 2,
                            "6h": 3
                        };
                        comp1 = mapping[a.frequency];
                        comp2 = mapping[b.frequency];
                        break;
                    default:
                        comp1 = a[sort.fieldName];
                        comp2 = b[sort.fieldName];
                    }
                    if (comp1 < comp2) {
                        return sort.descending ? 1 : -1;
                    }
                    if (comp1 > comp2) {
                        return sort.descending ? -1 : 1;
                    }
                    return 0;
                });
            };

            /**
                 * Process error from API
                 * @param err
                 */
            this.processError = function (err) {
                self.errorHandler({ ERR: err });
            };

            /**
                 * Remove an element from the list (not removed in the API)
                 * @param {Object} element Notification element
                 */
            this.removeElement = function (element) {
                var eltIndex = self.ngModel.indexOf(element);
                if (eltIndex >= 0) {
                    self.ngModel.splice(eltIndex, 1);
                }
            };

            /**
                 * Remove an Element in the API
                 * @param {Object} element Notification element
                 */
            this.destroyElement = function (element) {
                element.frozen = true;
                OvhApiXdslNotifications.v6().remove({
                    xdslId: element.xdslService,
                    id: element.id
                }).$promise.then(
                    function () {
                        self.removeElement(element);
                    },
                    function (err) {
                        return self.processError(err);
                    }
                ).finally(function () {
                    element.frozen = false;
                });
            };

            /**
                 * Add an element in the API
                 * @param {Object} element Notification element
                 */
            this.submitElement = function (element) {
                element.frozen = true;
                element.editMode = false;
                OvhApiXdslNotifications.v6().add({
                    xdslId: element.xdslService
                }, element.getCreationData()).$promise.then(
                    function (data) {
                        element.id = data.id;
                        element.editMode = false;
                    },
                    function (err) {
                        element.editMode = true;
                        return self.processError(err);
                    }
                ).finally(function () {
                    element.frozen = false;
                });
            };

            /**
                 * Read the notifications from the API
                 */
            this.getNotifications = function () {
                self.loading = true;
                OvhApiXdslNotifications.Aapi().list({
                    xdslId: self.xdslService
                }).$promise.then(
                    function (data) {
                        if (_.isArray(data)) {
                            data.forEach(function (notif) {
                                self.ngModel.push(new NotificationElement(notif));
                            });
                        }
                    },
                    function (err) {
                        return self.processError(err);
                    }
                ).finally(function () {
                    self.loading = false;
                });
            };

            this.isTypeValid = function (value) {

                return value !== "sms" || self.accounts.length !== 0;
            };

            var init = function () {
                if (typeof self.ngModel === "undefined") {
                    self.ngModel = [];
                }

                // notification type choices
                self.types = [
                    { icon: "fa-envelope-o", name: "mail", label: "components_notification_mail" },
                    { icon: "fa-mobile", name: "sms", label: "components_notification_sms" }
                ];

                // Frequency choices
                self.frequencies = [
                    { name: "once", label: "components_notification_once" },
                    { name: "5m", label: "components_notification_5m" },
                    { name: "1h", label: "components_notification_1h" },
                    { name: "6h", label: "components_notification_6h" }
                ];

                // get the SMS accounts
                OvhApiSms.Aapi().query(
                    {}).$promise.then(
                    function (data) {
                        self.accounts = data;
                    },
                    function (err) {
                        return self.processError(err);
                    }
                );

                // Get the Notifications
                $scope.$watch("NotificationListCtrl.xdslService", function () {
                    self.getNotifications();
                }, true);

                $scope.$watch("NotificationListCtrl.ngModel", function (newValue) {
                    self.onChange({ ELEMENTS: newValue });
                }, true);

            };

            init();
        }
    }
    );
