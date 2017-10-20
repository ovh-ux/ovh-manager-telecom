angular.module("managerApp").controller("TelecomTelephonyServiceAssistLogsCtrl", function ($scope, $q, $translate, $stateParams, TelephonyMediator, OvhApiTelephony, OvhApiMe, Toast, PAGINATION_PER_PAGE) {
    "use strict";

    var self = this;

    self.service = null;
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
    self.backSref = null;

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
        self.service.startEdition();
        self.model.configEdit = true;

        if (!self.user && !self.service.notifications.logs.email) {
            self.loading.user = true;

            // if request fail - no need to catch it
            OvhApiMe.Lexi().get().$promise.then(function (user) {
                self.user = user;
                self.service.notifications.logs.email = self.user.email;
            }).finally(function () {
                self.loading.user = false;
            });
        } else if (!self.service.notifications.logs.email) {
            self.service.notifications.logs.email = self.user.email;
        }
    };

    self.cancelNotificationsChange = function () {
        self.service.stopEdition(true);
        self.model.configEdit = false;
    };

    self.saveLogsNotifications = function () {
        self.loading.save = true;

        // reset email and sendIfNull if frequency is "Never"
        if (self.service.notifications.logs.frequency === "Never") {
            self.service.notifications.logs.email = null;
            self.service.notifications.logs.sendIfNull = false;
        }

        return self.service.save().then(function () {
            self.service.stopEdition();
        }).catch(function (error) {
            self.service.stopEdition(true);
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

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function () {
            self.service = TelephonyMediator.findService($stateParams.serviceName);

            self.backSref = self.service.isFax ? "telecom.telephony.fax.assist" : "telecom.telephony.line.assist";

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
        if (self.service) {
            self.service.stopEdition(true);
        }
    });

    /* -----  End of INITIALIZATION  ------*/

    init();

});
