angular.module("managerApp").controller("TelecomTelephonyServiceAssistLogsCtrl", function ($q, $translate, $state, $stateParams, voipService, voipLineFeature, OvhApiMe, Toast, PAGINATION_PER_PAGE, telephonyBulk) {
    "use strict";

    var self = this;

    self.service = null;
    self.logs = null;
    self.logsPerPage = PAGINATION_PER_PAGE;

    // notifications edit
    self.edition = {
        active: false,
        notifications: null
    };

    // logs
    self.availableDayInterval = ["today", "yesterday", "2 days ago", "3 days ago"];
    self.availableLogsFrequencies = ["Never", "Twice a day", "Once a day"];

    self.loading = {
        init: false,
        refresh: false,
        user: false,
        save: false
    };

    self.model = {
        dayInterval: self.availableDayInterval[0]
    };
    self.user = null;

    /* =============================
    =            EVENTS            =
    ============================== */

    /**
     *  Refresh service logs.
     */
    self.onLogsFrequencySelectChange = function () {
        self.loading.refresh = true;

        return voipService.fetchServiceDiagnosticReports(self.service, self.model.dayInterval).then(function (logs) {
            self.logs = logs;
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_assist_support_logs_refresh_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.refresh = false;
        });
    };

    /* ----------  NOTIFICATIONS EDITION  ---------- */

    /**
     *  Start edition of the feature notifications.
     */
    self.onStartEditBtnClick = function () {
        // copy notifications from fetched feature
        self.edition.notifications = angular.copy(self.service.feature.notifications);

        // start edition mode
        self.edition.mode = true;

        // fetch user if not already done
        if (!self.user && !self.edition.notifications.logs.email) {
            self.loading.user = true;

            // if request fail - no need to catch it
            OvhApiMe.v6().get().$promise.then(function (user) {
                self.user = user;
                self.edition.notifications.logs.email = self.user.email;
            }).finally(function () {
                self.loading.user = false;
            });
        } else if (!self.edition.notifications.logs.email) {
            self.edition.notifications.logs.email = self.user.email;
        }
    };

    /**
     *  Cancel all the modifications made to feature notifications.
     */
    self.onCancelEditionBtnClick = function () {
        self.edition.notifications = null;
        self.edition.mode = false;
    };

    /**
     *  Launch the feature notifications save.
     */
    self.onNotificationsEditFormSubmit = function () {
        self.loading.save = true;

        // reset email and sendIfNull if frequency is "Never"
        if (self.edition.notifications.logs.frequency === "Never") {
            self.edition.notifications.logs.email = null;
            self.edition.notifications.logs.sendIfNull = false;
        }

        // save notifications
        return voipLineFeature.saveFeature(self.service.feature, {
            notifications: self.edition.notifications
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_assist_support_logs_save_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
            self.edition.mode = false;
            self.edition.notifications = null;
        });
    };

    /* -----  End of EVENTS  ------ */

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.loading.init = true;

        return voipService.fetchSingleService($stateParams.billingAccount, $stateParams.serviceName).then(function (service) {
            self.service = service;
            self.bulkDatas.billingAccount = self.service.billingAccount;
            self.bulkDatas.serviceName = self.service.serviceName;
            self.type = self.service.featureType === "fax" ? "fax" : "line";

            return $q.all({
                feature: voipLineFeature.fetchFeature(service),
                logs: self.onLogsFrequencySelectChange()
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_assist_support_logs_init_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/
    self.bulkDatas = {
        infos: {
            name: "assistLogs",
            actions: [{
                name: "assistLogs",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        return _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });
    };

    self.getBulkParams = function () {
        self.bulkDatas.infos.actions[0].route = "/telephony/{billingAccount}/" + self.type + "/{serviceName}";
        var logs = self.edition.mode ? self.edition.notifications.logs : self.service.feature.notifications.logs;
        return {
            notifications: {
                logs: _.pick(logs, ["frequency", "sendIfNull", "email"])
            }
        };
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_assist_support_logs_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_assist_support_logs_bulk_some_success", {
                count: bulkResult.success.length

            }),
            error: $translate.instant("telephony_line_assist_support_logs_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        self.$onInit();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_assist_support_logs_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

});
