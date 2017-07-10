angular.module("managerApp").controller("TelephonySchedulerExportCtrl", function ($timeout, $uibModalInstance, modalData, telephonyScheduler, SCHEDULER_CATEGORY_TO_TIME_CONDITION_SLOT_TYPE) {
    "use strict";

    var self = this;
    var categories = null;

    self.loading = {
        init: false,
        "export": false
    };

    self.status = {
        exported: false
    };

    self.scheduler = null;
    self.timeCondition = null;
    self.filters = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.convertCategoryToSlot = function (category) {
        return _.find(self.timeCondition.slots, {
            name: _.get(SCHEDULER_CATEGORY_TO_TIME_CONDITION_SLOT_TYPE, category)
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function (datas) {
        return $uibModalInstance.close(datas);
    };

    self.startExport = function () {
        self.loading.export = true;

        return self.scheduler.getEvents().then(function () {
            var fileName = [self.scheduler.billingAccount, self.scheduler.serviceName, "export"].join("_") + ".ics";
            var filters = _.chain(categories).filter({
                active: false
            }).map("value").value();
            var blob = new Blob([self.scheduler.exportToIcs(filters)], {
                type: "text/calendar;charset=utf-8;"
            });

            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                var downloadLink = document.createElement("a");
                downloadLink.setAttribute("href", window.URL.createObjectURL(blob));
                downloadLink.setAttribute("download", fileName);
                downloadLink.setAttribute("target", "_blank");
                downloadLink.setAttribute("style", "visibility:hidden");

                document.body.appendChild(downloadLink);
                $timeout(function () {
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });
            }

            self.status.exported = true;

            return $timeout(function () {
                self.close();
            }, 1000);

        }, function (error) {
            return self.cancel(error);
        }).finally(function () {
            self.loading.export = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        self.scheduler = modalData.scheduler;
        self.timeCondition = modalData.timeCondition;
        self.filters = modalData.filters;

        return telephonyScheduler.getAvailableCategories().then(function (apiCategories) {
            categories = _.chain(apiCategories).filter(function (category) {
                return self.timeCondition ? self.convertCategoryToSlot(category) : true;
            }).map(function (category) {
                return {
                    value: category,
                    active: self.filters.indexOf(category) === -1
                };
            }).value();

            self.chunkedCategories = _.chunk(categories, 2);
        }).finally(function () {
            self.loading.init = false;
        }).catch(function (error) {
            self.cancel(error);
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
