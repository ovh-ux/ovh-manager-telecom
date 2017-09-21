angular.module("managerApp").controller("TelecomTelephonyLineAssistLogsCtrl", function ($scope, $q, $translate, $stateParams, TelephonyMediator, OvhApiTelephony, OvhApiMe, Toast, PAGINATION_PER_PAGE) {
    "use strict";

    var self = this;

    self.line = null;
    self.logs = null;
    self.logsPerPage = PAGINATION_PER_PAGE;

    self.availableDayInterval = ["today", "yesterday", "2 days ago", "3 days ago"];
    self.availableLogsFrequencies = ["Never", "Twice a day", "Once a day"];
    self.loading = {
        init: false,
        refresh: false,
        user: false,
        save: false
    };
    self.model = {
        dayInterval: self.availableDayInterval[0],
        configEdit: false
    };
    self.user = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.refreshLogs = function () {
        self.loading.refresh = true;

        return OvhApiTelephony.Service().Lexi().diagnosticReports({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName,
            dayInterval: self.model.dayInterval
        }).$promise.then(function (logs) {
            self.logs = logs;
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_assist_support_logs_refresh_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.refresh = false;
        });
    };

    self.startNotificationsChange = function () {
        self.line.startEdition();
        self.model.configEdit = true;

        if (!self.user && !self.line.notifications.logs.email) {
            self.loading.user = true;

            // if request fail - no need to catch it
            OvhApiMe.Lexi().get().$promise.then(function (user) {
                self.user = user;
                self.line.notifications.logs.email = self.user.email;
            }).finally(function () {
                self.loading.user = false;
            });
        } else if (!self.line.notifications.logs.email) {
            self.line.notifications.logs.email = self.user.email;
        }
    };

    self.cancelNotificationsChange = function () {
        self.line.stopEdition(true);
        self.model.configEdit = false;
    };

    self.saveLogsNotifications = function () {
        self.loading.save = true;

        // reset email and sendIfNull if frequency is "Never"
        if (self.line.notifications.logs.frequency === "Never") {
            self.line.notifications.logs.email = null;
            self.line.notifications.logs.sendIfNull = false;
        }

        return self.line.save().then(function () {
            self.line.stopEdition();
        }).catch(function (error) {
            self.line.stopEdition(true);
            Toast.error([$translate.instant("telephony_line_assist_support_logs_save_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.save = false;
            self.model.configEdit = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);

            return self.refreshLogs();
        }, function (error) {
            Toast.error([$translate.instant("telephony_line_assist_support_logs_init_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    // in case we don't click on cancel button
    $scope.$on("$destroy", function () {
        if (self.line) {
            self.line.stopEdition(true);
        }
    });

    /* -----  End of INITIALIZATION  ------*/

    init();

});
