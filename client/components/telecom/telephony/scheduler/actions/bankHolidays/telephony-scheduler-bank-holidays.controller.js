angular.module("managerApp").controller("TelephonySchedulerBankHolidaysCtrl", function ($translate, $uibModalInstance, modalData, SCHEDULER_BANK_HOLIDAYS) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.model = {
        country: null,
        year: moment().get("year")
    };

    self.countryList = null;
    self.yearList = null;
    self.holidaysLists = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    /**
     *  Get the Easter day according to https://www.irt.org/articles/js052/index.htm
     */
    function getEaster (Y) {
        var C = Math.floor(Y / 100);
        var N = Y - (19 * Math.floor(Y / 19));
        var K = Math.floor((C - 17) / 25);
        var I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + (19 * N) + 15;
        I = I - (30 * Math.floor(I / 30));
        I = I - (Math.floor(I / 28) * (1 - (Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11))));
        var J = Y + Math.floor(Y / 4) + I + 2 - C + Math.floor(C / 4);
        J = J - (7 * Math.floor(J / 7));
        var L = I - J;
        var M = 3 + Math.floor((L + 40) / 44);
        var D = L + 28 - (31 * Math.floor(M / 4));

        return [Y, _.padLeft(M, 2, "0"), _.padLeft(D, 2, "0")].join("-");
    }

    function getSpecialBankHoliday (bankDay, easterDay, year) {
        switch (bankDay.name) {
        case "easter_monday":
            return moment(easterDay).add(1, "day");
        case "ascension_day":
            // ascension is 40 days after easter
            return moment(easterDay).add(39, "day");
        case "whit_monday":
            // whit sunday (Pentecost) is 50 days after easter
            return moment(easterDay).add(50, "day");
        case "good_friday":
            // friday before easter
            return moment(easterDay).subtract(2, "day");
        case "may_day":
            // The May Day bank holiday falls on the first Monday in May
            return moment().year(year).month(4).startOf("month").startOf("isoWeek");
        case "spring_bank_holiday":
            // last monday in May
            return moment().year(year).month(4).endOf("month").startOf("isoWeek");
        case "summer_bank_holiday":
            // last monday in August
            return moment().year(year).month(7).endOf("month").startOf("isoWeek");
        default:
            return null;
        }
    }

    self.refreshBankHolidaysList = function () {
        var countryBankHolidays = SCHEDULER_BANK_HOLIDAYS[self.model.country];
        var easterDayOfYear;
        var bankHolidayDate;
        var isBankHolidayInEventRange;
        self.holidaysLists = {};

        angular.forEach(self.yearList, function (year) {
            easterDayOfYear = getEaster(year);
            self.holidaysLists[year] = [];
            angular.forEach(countryBankHolidays, function (bankDay) {
                bankHolidayDate = bankDay.date ? moment([year, bankDay.date].join("-")) : getSpecialBankHoliday(bankDay, easterDayOfYear, year);
                if (moment().subtract(1, "day").isBefore(bankHolidayDate)) {
                    isBankHolidayInEventRange = modalData.scheduler.isEventInExistingRange({
                        categories: "holidays",
                        dateStart: bankHolidayDate.toDate(),
                        dateEnd: moment(bankHolidayDate).endOf("day").toDate()
                    });

                    self.holidaysLists[year].push({
                        name: bankDay.name,
                        date: bankHolidayDate,
                        active: true,
                        disabled: isBankHolidayInEventRange
                    });
                }
            });
        });
    };

    self.filterEvents = function (year) {
        if (year) {
            return _.filter(self.holidaysLists[year], function (bankHoliday) {
                return bankHoliday.active && !bankHoliday.disabled;
            });
        }
        var bankHolidays = [];
        _.keys(self.holidaysLists).forEach(function (theYear) {
            bankHolidays = bankHolidays.concat(self.filterEvents(theYear));
        });
        return bankHolidays;

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

    self.manageInject = function () {
        return self.close({
            newEvents: self.filterEvents()
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function getCountryModel () {
        switch (modalData.scheduler.timeZone) {
        case "Europe/Berlin":
            return "DE";
        case "Europe/Brussels":
            return "BE";
        case "Europe/London":
            return "GB";
        case "Europe/Madrid":
            return "ES";
        case "Europe/Paris":
            return "FR";
        case "Europe/Zurich":
            return "CH";
        default:
            return "FR";
        }
    }

    function init () {
        // build country list
        self.countryList = _.chain(SCHEDULER_BANK_HOLIDAYS).keys().map(function (country) {
            return {
                value: country,
                label: $translate.instant("country_" + country)
            };
        }).value();

        // build year list
        self.yearList = [self.model.year, moment().add(1, "year").get("year"), moment().add(2, "year").get("year")];

        // get default selected country depending to scheduler timezone
        self.model.country = getCountryModel();

        self.loading.init = true;

        return modalData.scheduler.getEvents({
            "dateStart.from": moment().year(_.first(self.yearList)).startOf("year").format(),
            "dateEnd.to": moment().year(_.last(self.yearList)).endOf("year").format(),
            categories: "holidays"
        }).then(function () {
            // get the bank holidays dates
            self.refreshBankHolidaysList();
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
