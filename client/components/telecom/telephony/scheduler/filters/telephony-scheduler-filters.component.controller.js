angular.module("managerApp").controller("TelephonySchedulerFiltersCtrl", function (telephonyScheduler) {
    "use strict";

    var self = this;
    var categories = null;

    self.loading = {
        init: true
    };

    self.chunkedCategories = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.convertCategoryToSlot = function (category) {
        return telephonyScheduler.convertCategoryToSlot(self.telephonySchedulerCtrl.timeCondition, category);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.toggleCategoryDisplay = function (category) {
        category.active = !category.active;

        self.filters.categories = _.chain(categories).filter({
            active: false
        }).map("value").value();

        self.onChange();
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.loading.init = true;
        self.telephonySchedulerCtrl.loading.filters = true;

        // check params
        self.filters = _.defaults(self.filters || {}, {
            categories: [] // will contain all categories to hide
        });

        return telephonyScheduler.getAvailableCategories().then(function (apiCategories) {
            categories = _.chain(apiCategories).filter(function (category) {
                return self.telephonySchedulerCtrl.timeCondition ? self.convertCategoryToSlot(category) : true;
            }).map(function (category) {
                return {
                    value: category,
                    active: true
                };
            }).value();

            self.chunkedCategories = _.chunk(categories, 2);
        }).finally(function () {
            self.loading.init = false;
            self.telephonySchedulerCtrl.loading.filters = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
