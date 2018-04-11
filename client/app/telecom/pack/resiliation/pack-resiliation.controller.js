angular.module("managerApp").controller("PackResiliationCtrl", function ($stateParams, $state, $translate, ToastError, OvhApiPackXdslResiliation, Toast, $uibModal, $timeout, $q, OvhApiMe, PackMediator, resiliationNotification) {
    "use strict";

    var self = this;
    self.model = {
        subServicesToKeep: {}
    };
    self.switch = {};
    self.config = {
        orderedServicesToList: [
            "xdslAccess", "domain", "voipLine",
            "exchangeAccount", "exchangeIndividual",
            "exchangeLite", "exchangeOrganization",
            "voipEcoFax", "hostedEmail", "siteBuilderFull",
            "siteBuilderStart", "voipAlias"
        ],
        xdslAccess: {
            cannotBeKept: true
        }
    };
    self.resiliationTerms = null;

    this.init = function () {
        self.subServicesTerms = null;
        self.subServicesTermsLoading = false;
        self.loading = true;
        self.model.when = null;
        self.dpOpts = {};

        OvhApiPackXdslResiliation.Aapi().terms({
            packId: $stateParams.packName
        }).$promise.then(function (data) {
            self.dpOpts.minDate = data.data.minResiliationDate ? new Date(data.data.minResiliationDate) : new Date();
            self.minResiliationDate = self.dpOpts.minDate;
            self.resiliationTerms = {};

            angular.forEach(data, function (val, key) {
                if (key.indexOf("$") !== 0) {
                    self.resiliationTerms[key] = data[key];
                }
            });

            self.resiliationTerms.typeName = $translate.instant("pack_resiliation_type_name");
            if (self.resiliationTerms.data.resiliationReasons) {
                self.resiliationTerms.data.resiliationReasons =
                        self.resiliationTerms.data.resiliationReasons.map(function (reason) {
                            return {
                                value: reason,
                                label: $translate.instant("pack_resiliation_choice_" + reason)
                            };
                        });
            }

            if (self.resiliationTerms.name) {
                self.resiliationTerms.nameToDisplay = self.resiliationTerms.name;
            } else {
                self.resiliationTerms.nameToDisplay = self.resiliationTerms.packName;
            }

            self.updateFeeSummary();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });

        self.subServicesTermsLoading = true;
        self.subServicesTerms = null;
        self.subServicesTermsError = false;

        OvhApiPackXdslResiliation.Aapi().subServicesTerms({
            packId: $stateParams.packName
        }).$promise.then(function (data) {
            self.subServicesTerms = data;
        }).catch(function (err) {
            self.subServicesTermsError = true;
            return new ToastError(err);
        }).finally(function () {
            self.subServicesTermsLoading = false;
        });
    };

    /**
     * Get the current currency symbol
     *
     * @return promise with the symbol of the current currency
     */
    this.getCurrentCurrencySymbol = function () {
        return OvhApiMe.v6().get().$promise.then(function (me) {
            return me && me.currency ? me.currency.symbol : "";
        });
    };

    /**
     * Validator for the resiliationDate
     * @param {Date} specifiedDate Date to validate
     */
    this.checkDate = function () {
        return !self.model.when || (validator.isDate(self.model.when) &&
                (self.model.when >= self.minResiliationDate));
    };

    /**
     * Apply the state of the global checkbox to all the sub checkbox if needed
     * @param {String} the type of the service
     */
    this.switchApply = function (serviceType) {
        var isUpdated = false;
        angular.forEach(self.subServicesTerms[serviceType], function (service) {
            if (service.keepServiceTerms.isAllowed) {
                self.model.subServicesToKeep[service.id] = self.switch[serviceType];
                isUpdated = true;
            }
        });

        if (isUpdated) {
            self.updateFeeSummary();
        } else {
            $timeout(function () {
                self.switch[serviceType] = !self.switch[serviceType];
            }, 200);
        }
    };

    /**
     * Update the fee summary
     */
    this.updateFeeSummary = function () {
        self.feeSummary = {
            duePrice: _.get(self, "resiliationTerms.data.due"),
            keepingPrice: 0.0,
            renewPrice: {}
        };

        self.config.orderedServicesToList.forEach(function (serviceType) {
            if (self.subServicesTerms && self.subServicesTerms[serviceType]) {
                self.subServicesTerms[serviceType].forEach(function (service) {
                    angular.forEach(self.model.subServicesToKeep, function (go, serviceId) {
                        var key;

                        // the key of the Object is a stringified service id
                        if (go && String(service.id) === serviceId) {
                            key = service.keepServiceTerms.renewPeriod.toString();

                            // [IEEE 754]: store int to avoid flotting point number storage problem
                            self.feeSummary.keepingPrice += service.keepServiceTerms.price.value * 100;

                            if (self.feeSummary.renewPrice[key] === undefined) {
                                self.feeSummary.renewPrice[key] = 0;
                            }

                            self.feeSummary.renewPrice[key] += service.keepServiceTerms.renewPrice.value * 100;
                        }
                    });
                });
            }
        });

        // [IEEE 754]: restore real value: Int -> float (.2)
        self.feeSummary.keepingPrice = self.feeSummary.keepingPrice ? Number(self.feeSummary.keepingPrice / 100).toFixed(2) : "0";
        angular.forEach(self.feeSummary.renewPrice, function (value, key) {
            self.feeSummary.renewPrice[key] = Number(self.feeSummary.renewPrice[key] / 100).toFixed(2);
        });

        self.getCurrentCurrencySymbol().then(function (currency) {
            self.feeSummary.currency = currency;
        });
    };

    /**
     * Check the state of the global checkbox
     * @param {String} the type of the service
     */
    this.checkSwitchState = function (serviceType) {
        for (var i = 0, imax = self.subServicesTerms[serviceType].length; i < imax && self.switch[serviceType];
            i++) {
            var service = self.subServicesTerms[serviceType][i];
            if (service.keepServiceTerms.isAllowed && !self.model.subServicesToKeep[service.id]) {
                self.switch[serviceType] = false;
            }
        }
    };

    /**
     * Check/update all things depending of the checked sub services
     * @param {String} the type of the service
     */
    this.updateAllInfluencedByCheckedSubServices = function (serviceType) {
        self.checkSwitchState(serviceType);
        self.updateFeeSummary();
    };

    /**
     * True if serviceType has at least one sub service allowed to be kept,
     * false otherwise.
     */
    this.hasKeepableSubServices = function (serviceType) {
        return _.some(self.subServicesTerms[serviceType], function (service) {
            return _.get(service, "keepServiceTerms.isAllowed");
        });
    };

    /**
     * Compute the new price according to the new date
     * @returns {*}
     */
    this.computePrice = function () {
        self.computingPrice = true;
        return OvhApiPackXdslResiliation.v6().resiliationTerms({
            packName: $stateParams.packName,
            resiliationDate: self.model.when ? self.model.when.toISOString() : null
        }, null).$promise.then(function (data) {
            self.resiliationTerms.data.due = data.due;
            self.updateFeeSummary();
        }, function (err) {
            return new ToastError(err);
        }
        ).finally(function () {
            self.computingPrice = false;
        });
    };

    /**
     * Open the date picker
     * @param event
     */
    this.openDatePicker = function (event) {
        self.pickerOpened = true;
        self.pickerOpenedPreventConflict = true;
        event.stopPropagation();

        $timeout(function () {
            self.pickerOpenedPreventConflict = false;
        }, 500);
    };

    /**
     * Switch the date picker state, if is open then close,
     * if is closed then open it
     *
     * @param event
     */
    this.switchDatePickerState = function (event) {
        if (!self.pickerOpenedPreventConflict) {
            self.pickerOpened = !self.pickerOpened;
        }

        event.stopPropagation();
    };

    /**
     * Resiliate a pack
     * @param  {Object} pack   Pack to resiliate
     * @param  {Object} survey Reason to resiliate
     * @param {Boolean} accept If true the resiliation must be done
     */
    this.resiliatePack = function () {
        self.loading = true;
        return OvhApiPackXdslResiliation.v6().resiliate({
            packName: $stateParams.packName
        }, {
            resiliationSurvey: {
                type: self.model.reason.value,
                comment: self.model.comment ? self.model.comment : null
            },
            resiliationDate: self.model.when ? self.model.when.toISOString() : null,
            servicesToKeep: _.remove(_.map(self.model.subServicesToKeep, function (value, key) {
                return value ? key : null;
            }), null)
        }).$promise.then(function () {
            resiliationNotification.success = true;
            $state.go("telecom.pack", { packName: $stateParams.packName });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    };

    /**
     * Cancel an on-going resiliation
     * @param  {Object} pack Pack to cancel resiliation
     */
    this.cancelPackResiliation = function (pack) {
        self.loading = true;
        return OvhApiPackXdslResiliation.v6().cancelResiliation({
            packName: pack.packName
        }, null).$promise.then(function () {
            resiliationNotification.cancelSuccess = true;
            $state.go("telecom.pack", { packName: $stateParams.packName });
        }, function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    };

    this.openConfirmation = function () {
        $uibModal.open(
            {
                templateUrl: "components/resiliation/resiliation.modal.html",
                controllerAs: "ResiliationModelCtrl",
                controller: function (subject) {
                    this.resiliation = { confirm: {} };
                    this.subject = subject;
                },
                resolve: {
                    subject: function () {
                        return self.resiliationReason;
                    }
                }
            }
        ).result.then(self.resiliatePack);
    };

    this.init();
});
