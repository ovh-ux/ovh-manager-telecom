angular.module("managerApp").controller("TelephonySchedulerCtrl", function ($q, $locale, $translate, $translatePartialLoader, $uibModal, OvhApiTelephony, OvhApiMe, VoipSchedulerEvent, Poller, Toast, uiCalendarConfig, matchmedia) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        filters: false,
        params: false,
        translations: false,
        save: false,
        events: false,
        edit: false,
        refresh: false,
        "import": false,
        deleteAll: false
    };

    self.model = {
        currentView: "month",
        filters: {}
    };

    self.status = {
        displayActions: false,
        deleteConfirm: false,
        isDesktop: false
    };

    self.calendarOptions = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.fetchEvents = function (start, end) {
        self.loading.events = true;

        return self.scheduler.getEvents({
            "dateStart.from": start.format(),
            "dateEnd.to": end.format()
        }).then(function (events) {
            return events;
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_scheduler_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.events = false;
        });
    };

    self.applyFilters = function (events) {
        return _.chain(events).filter(function (event) {
            return event.status !== "TODELETE" && (self.model.filters.categories ? self.model.filters.categories.indexOf(event.categories) === -1 : true);
        }).map(function (event) {
            return angular.extend(event.toFullCalendarEvent(), {
                className: event.categories
            });
        }).value();
    };

    self.getCalendarTitle = function () {
        return $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("getView").title;
    };

    self.getCurrentDay = function () {
        return moment().format("DD");
    };

    self.hasEventInEdition = function () {
        return !!_.find(self.scheduler.events, {
            inEdition: true
        });
    };

    self.hasChange = function () {
        return self.scheduler.hasChange() || (self.timeCondition && self.timeCondition.hasChange());
    };

    /* ----------  Import task polling  ----------*/

    function startImportTaskPolling (taskId) {
        return Poller.poll(["/telephony", self.scheduler.billingAccount, "service", self.scheduler.serviceName, "task", taskId].join("/"), {
            cache: false
        }, {
            namespace: "importIcs_" + self.scheduler.serviceName,
            interval: 1000,
            retryMaxAttempts: 0
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    /* ----------  Scheduler actions  ----------*/

    self.cancelEdition = function () {
        // stop the scheduler edition
        self.scheduler.stopEdition(true, false, true).startEdition();

        // stop the timeCondition edition
        if (self.timeCondition) {
            self.timeCondition.stopEdition(true).startEdition();
        }

        // and refetch events to update ui calendar display
        $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("refetchEvents");
    };

    self.saveScheduler = function () {
        self.loading.save = true;

        var allPromises = {
            scheduler: self.scheduler.save().then(function () {
                // stop edition and restart with saved value
                self.scheduler.stopEdition(false, true).startEdition();
            }).catch(function (errors) {
                angular.forEach(errors, function (error) {
                    Toast.error([$translate.instant("telephony_scheduler_save_error"), (error.data && error.data.message) || ""].join(" "));
                });
                return $q.reject(errors);
            })
        };

        if (self.timeCondition) {
            allPromises.timeCondition = self.timeCondition.save().then(function () {
                // stop edition and restart with saved value
                self.timeCondition.stopEdition(false, true).startEdition();
            }).catch(function (error) {
                Toast.error([$translate.instant("telephony_scheduler_save_error"), _.get(error, "data.message", "")].join(" "));
                return $q.reject(error);
            });
        }

        return $q.all(allPromises).finally(function () {
            self.loading.save = false;
        });
    };

    /* ----------  Calendar actions  ----------*/

    self.onCalendarNavigate = function (direction) {
        $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar(direction);
    };

    self.onChangeCalendarView = function (viewName) {
        self.model.currentView = viewName;
        $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("changeView", viewName);
    };

    self.createEvent = function (dateStart, dateEnd) {
        return new VoipSchedulerEvent({
            billingAccount: self.scheduler.billingAccount,
            serviceName: self.scheduler.serviceName,
            dateStart: dateStart,
            dateEnd: dateEnd,
            status: "CREATING"
        });
    };

    /* ----------  Communication between components  ----------*/

    self.onFiltersChange = function () {
        $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("refetchEvents");
    };

    /* ----------  Actions menu  ----------*/

    self.manageAdd = function () {
        $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("select", moment().startOf("day"), moment().endOf("day"));
        self.status.displayActions = false;
    };

    self.manageImport = function () {
        var importModal = $uibModal.open({
            animation: true,
            backdrop: "static",
            templateUrl: "components/telecom/telephony/scheduler/actions/import/telephony-scheduler-import.html",
            controller: "TelephonySchedulerImportCtrl",
            controllerAs: "SchedulerImportCtrl",
            resolve: {
                modalData: function () {
                    return {
                        scheduler: self.scheduler
                    };
                }
            }
        });

        importModal.result.then(function (importDatas) {
            self.loading.import = true;

            startImportTaskPolling(importDatas.importTask.taskId).then(function () {
                OvhApiTelephony.Scheduler().Events().v6().resetAllCache();
                $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("refetchEvents");
                Toast.success($translate.instant("telephony_scheduler_import_success"));
            }, function (error) {
                Toast.error([$translate.instant("telephony_scheduler_import_error"), (error && error.message) || ""].join(" "));
                return $q.reject(error);
            }).finally(function () {
                self.loading.import = false;

                // try to delete uploaded document
                if (importDatas.uploadedDocument) {
                    OvhApiMe.Document().v6().delete({
                        id: importDatas.uploadedDocument.id
                    });
                }
            });
        }, function (error) {
            if (error && !_.isString(error)) {
                Toast.error([$translate.instant("telephony_scheduler_import_error"), (error.data && error.data.message) || ""].join(" "));
            }
            return $q.reject(error);
        });

        self.status.displayActions = false;

        return importModal;
    };

    self.manageExport = function () {
        var exportModal = $uibModal.open({
            animation: true,
            backdrop: "static",
            templateUrl: "components/telecom/telephony/scheduler/actions/export/telephony-scheduler-export.html",
            controller: "TelephonySchedulerExportCtrl",
            controllerAs: "SchedulerExportCtrl",
            resolve: {
                modalData: function () {
                    return {
                        scheduler: self.scheduler,
                        timeCondition: self.timeCondition,
                        filters: self.model.filters.categories
                    };
                }
            }
        });

        exportModal.result.catch(function (error) {
            if (error && !_.isString(error)) {
                Toast.error([$translate.instant("telephony_scheduler_export_error"), (error.data && error.data.message) || ""].join(" "));
            }
            return $q.reject(error);
        });

        self.status.displayActions = false;

        return exportModal;
    };

    self.manageBankHolidays = function () {
        var bankHolidaysModal = $uibModal.open({
            animation: true,
            backdrop: "static",
            templateUrl: "components/telecom/telephony/scheduler/actions/bankHolidays/telephony-scheduler-bank-holidays.html",
            controller: "TelephonySchedulerBankHolidaysCtrl",
            controllerAs: "SchedulerHolidaysCtrl",
            resolve: {
                modalData: function () {
                    return {
                        scheduler: self.scheduler
                    };
                }
            }
        });

        bankHolidaysModal.result.then(function (datas) {
            if (datas && datas.newEvents && datas.newEvents.length) {
                datas.newEvents.forEach(function (event) {
                    self.scheduler.addEvent({
                        title: $translate.instant("telephony_scheduler_bank_holidays_" + event.name),
                        categories: "holidays",
                        status: "TOCREATE",
                        dateStart: event.date.toDate(),
                        dateEnd: moment(event.date).endOf("day").toDate()
                    });
                });
                $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("refetchEvents");
            }
        });

        self.status.displayActions = false;

        return bankHolidaysModal;
    };

    self.manageDeleteAll = function () {
        self.loading.deleteAll = true;

        return self.scheduler.getEvents().then(function () {
            // remove events to create from scheduler events list
            _.filter(self.scheduler.events, {
                status: "TOCREATE"
            }).forEach(function (event) {
                self.scheduler.removeEvent(event);
            });

            self.scheduler.events.forEach(function (event) {
                event.startEdition().status = "TODELETE";
            });

            $(uiCalendarConfig.calendars.eventsCalendar).fullCalendar("refetchEvents");
        }).finally(function () {
            self.loading.deleteAll = false;
            self.status.deleteConfirm = false;
            self.status.displayActions = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Translations load  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/scheduler");
        $translatePartialLoader.addPart("../components/telecom/telephony/timeCondition/slot");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        self.loading.init = true;

        return getTranslations().then(function () {
            // start scheduler edition
            self.scheduler.startEdition();

            // start timeCondition edition
            if (self.timeCondition) {
                self.timeCondition.startEdition();
            }

            // register is desktop check
            matchmedia.onDesktop(function (mediaQueryList) {
                self.status.isDesktop = mediaQueryList.matches;
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_scheduler_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* ----------  Component destroy  ----------*/

    self.$onDestroy = function () {
        self.scheduler.stopEdition(true);
        if (self.timeCondition) {
            self.timeCondition.stopEdition(true);
        }

        // stop task polling
        Poller.kill({
            namespace: "importIcs_" + self.scheduler.serviceName
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
