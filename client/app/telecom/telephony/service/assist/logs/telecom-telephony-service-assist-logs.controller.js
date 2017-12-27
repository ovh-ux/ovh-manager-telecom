angular.module("managerApp").controller("TelecomTelephonyServiceAssistLogsCtrl", function ($q, $translate, $stateParams, voipService, voipLineFeature, OvhApiMe, Toast, PAGINATION_PER_PAGE) {
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
            OvhApiMe.Lexi().get().$promise.then(function (user) {
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

        return voipService.fecthSingleService($stateParams.billingAccount, $stateParams.serviceName).then(function (service) {
            self.service = service;

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

});
