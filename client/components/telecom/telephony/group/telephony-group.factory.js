angular.module("managerApp").factory("TelephonyGroup", function ($q, OvhApiTelephony, TelephonyGroupLine, TelephonyGroupNumber, TelephonyGroupFax, OvhApiOrder, TELEPHONY_REPAYMENT_CONSUMPTION) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroup (optionsParam) {
        var options = optionsParam;

        if (!options) {
            options = {};
        }

        // options check
        if (!options.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroup");
        }

        // mandatory
        this.billingAccount = options.billingAccount.toLowerCase();

        // from API
        this.description = options.description;
        this.status = options.status;
        this.allowedOutplan = options.allowedOutplan;
        this.securityDeposit = options.securityDeposit;
        this.creditThreshold = options.creditThreshold;
        this.currentOutplan = options.currentOutplan;

        // custom
        this.inEdition = false;
        this.saveForEdition = null;
        this.availableOrders = null;
        this.calledFees = null;
        this.groupRepayments = null;

        // lines
        this.lines = [];
        this.numbers = [];
        this.fax = [];
        if (options.lines) {
            this.initLines(options.lines);
        }
        if (options.numbers) {
            this.initNumbers(options.numbers);
        }
        if (options.fax) {
            this.initFax(options.fax);
        }
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroup.prototype.getDisplayedName = function () {
        var self = this;

        return self.description || self.billingAccount;
    };

    TelephonyGroup.prototype.getService = function (serviceName) {
        var self = this;

        return self.getLine(serviceName) || self.getNumber(serviceName) || self.getFax(serviceName);
    };

    TelephonyGroup.prototype.getAllServices = function () {
        var self = this;
        var allServices = self.lines.concat(self.numbers, self.fax);

        return allServices;
    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroup.prototype.save = function () {
        var self = this;

        return OvhApiTelephony.v6().edit({
            billingAccount: self.billingAccount
        }, {
            description: self.description
        }).$promise;
    };

    /* ----------  LINES  ----------*/

    TelephonyGroup.prototype.initLines = function (lineOptions) {
        var self = this;

        if (_.isArray(lineOptions)) {
            angular.forEach(lineOptions, function (lineOption) {
                self.addLine(lineOption);
            });
        }

        return self.lines;
    };

    TelephonyGroup.prototype.addLine = function (lineOptions) {
        var self = this;
        var line;

        line = new TelephonyGroupLine(angular.extend(lineOptions || {}, {
            billingAccount: self.billingAccount
        }));

        self.lines.push(line);

        return line;
    };

    TelephonyGroup.prototype.getLine = function (lineServiceName) {
        var self = this;

        return _.find(self.lines, {
            serviceName: lineServiceName
        });
    };

    /* ----------  NUMBERS  ----------*/

    TelephonyGroup.prototype.initNumbers = function (numberOptions) {
        var self = this;

        if (_.isArray(numberOptions)) {
            angular.forEach(numberOptions, function (numberOpts) {
                self.addNumber(numberOpts);
            });
        }

        return self.numbers;
    };

    TelephonyGroup.prototype.addNumber = function (numberOptions) {
        var self = this;
        var number;

        number = new TelephonyGroupNumber(angular.extend(numberOptions, {
            billingAccount: self.billingAccount
        }));

        self.numbers.push(number);

        return number;
    };

    TelephonyGroup.prototype.getNumber = function (numberServiceName) {
        var self = this;

        return _.find(self.numbers, {
            serviceName: numberServiceName
        });
    };


    TelephonyGroup.prototype.fetchService = function (serviceName) {
        var self = this;
        var number;

        // TODO : handle when service is not an alias
        return OvhApiTelephony.Number().v6().get({
            billingAccount: self.billingAccount,
            serviceName: serviceName
        }).$promise.then(function (numberOptions) {
            number = new TelephonyGroupNumber(angular.extend(numberOptions, {
                billingAccount: self.billingAccount
            }));

            if (self.getNumber(number.serviceName)) {
                self.numbers.splice(_.findIndex(self.numbers, function (n) {
                    return n.serviceName === number.serviceName;
                }), 1, number);
            } else {
                self.addNumber(number);
            }

            return number;
        });
    };

    /* ----------  REPAYMENT CONSUMPTION  ----------*/

    TelephonyGroup.prototype.getRepaymentConsumption = function () {
        var self = this;

        return OvhApiTelephony.Service().RepaymentConsumption().Aapi().repayment({
            billingAccount: self.billingAccount
        }).$promise.then(function (consumptions) {
            var calledFeesPrefix = _.chain(TELEPHONY_REPAYMENT_CONSUMPTION)
                .get("calledFeesPrefix").valuesIn().flatten().value();
            var groupRepaymentsPrefix = _.chain(TELEPHONY_REPAYMENT_CONSUMPTION)
                .get("groupRepaymentsPrefix").valuesIn().flatten().value();

            self.calledFees = _.chain(calledFeesPrefix).map(function (prefix) {
                return _.filter(consumptions, function (consumption) {
                    return _.startsWith(consumption.dialed, prefix) &&
                        consumption.price !== 0 &&
                        moment(consumption.creationDatetime).isAfter(moment().subtract(60, "days").format());
                });
            }).flatten().value();

            self.groupRepayments = {
                all: consumptions,
                raw: _.chain(groupRepaymentsPrefix).map(function (prefix) {
                    return _.filter(consumptions, function (consumption) {
                        return _.startsWith(consumption.dialed, prefix) && consumption.price !== 0;
                    });
                }).flatten().value()
            };

            return self;
        });
    };

    /* ----------  FAX  ----------*/

    TelephonyGroup.prototype.initFax = function (faxOptionsList) {
        var self = this;

        if (_.isArray(faxOptionsList)) {
            angular.forEach(faxOptionsList, function (faxOptions) {
                self.addFax(faxOptions);
            });
        }

        return self.fax;
    };

    TelephonyGroup.prototype.addFax = function (faxOptions) {
        var self = this;
        var fax;

        fax = new TelephonyGroupFax(angular.extend(faxOptions, {
            billingAccount: self.billingAccount
        }));

        self.fax.push(fax);

        return fax;
    };

    TelephonyGroup.prototype.getFax = function (faxServiceName) {
        var self = this;

        return _.find(self.fax, {
            serviceName: faxServiceName
        });
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroup.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            description: angular.copy(self.description)
        };

        return self;
    };

    TelephonyGroup.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.description = angular.copy(self.saveForEdition.description);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    /* ----------  ORDERS  ----------*/

    TelephonyGroup.prototype.getAvailableOrderNames = function () {
        var self = this;

        if (self.availableOrders) {
            return $q.when(self.availableOrders);
        }
        return OvhApiOrder.Telephony().v6().get({
            billingAccount: self.billingAccount
        }).$promise.then(function (orderNames) {
            self.availableOrders = orderNames;
            return orderNames;
        }, function (error) {
            if (error.status === 404) {
                self.availableOrders = [];
                return self.availableOrders;
            }
            return $q.reject(error);

        });

    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroup;

});
