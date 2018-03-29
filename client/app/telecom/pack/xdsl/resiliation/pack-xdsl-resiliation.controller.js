angular.module("managerApp").controller("PackXdslResiliationCtrl", function ($scope, $stateParams, $translate, $q, $timeout, $filter, OvhApiXdsl, ToastError, OvhApiXdslResiliation, Toast) {
    "use strict";
    var self = this;

    this.loading = true;

    this.dpOpts = {
        minDate: null
    };

    this.init = function () {
        self.serviceDetails = null;
        self.resiliationTerms = null;
        self.loading = true;
        self.when = null;
        self.followup = null;

        return OvhApiXdsl.v6().get({ xdslId: $stateParams.serviceName }).$promise.then(function (data) {
            self.serviceDescription = $translate.instant("xdsl_resiliation_cancel_really", {
                description: data.description || data.serviceName
            });
            return data;
        }, function (err) {
            return new ToastError(err);
        }).then(function () {
            return OvhApiXdslResiliation.Aapi().terms({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (data) {
                self.resiliationTerms = data;
                self.dpOpts.minDate = data.data.minResiliationDate ? new Date(data.data.minResiliationDate) : new Date();
                self.minResiliationDate = self.dpOpts.minDate;

                self.when = new Date(self.resiliationTerms.data.resiliationDate);


                return OvhApiXdslResiliation.v6().followUp({
                    serviceName: $stateParams.serviceName
                }).$promise.then(function (followUp) {
                    followUp.dateTodo = $filter("date")(followUp.dateTodo, "dd/MM/yyyy");

                    self.resiliationTerms.onGoingResiliation = {
                        dateTodo: followUp.dateTodo,
                        needModemReturn: followUp.needModemReturn
                    };
                    return self.resiliationTerms;
                });
            }, function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loading = false;
            });
        });
    };

    /**
     * Resiliate a service
     * @param  {Object} service Service to resiliate
     * @param  {Object} survey  Reason to resiliate
     * @param {Boolean} accept  If true the resiliation must be done
     */
    this.resiliateService = function (service, survey, accept) {
        if (accept) {
            self.loading = true;
            return OvhApiXdslResiliation.v6().resiliate({
                serviceName: service.id
            }, {
                resiliationSurvey: survey,
                resiliationDate: self.when ? self.when.toISOString() : null
            }).$promise.then(function () {
                Toast.success($translate.instant("xdsl_resiliation_mail"));
                self.init();
            }, function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.loading = false;
            });
        }
        return $q.when(null);
    };

    /**
     * Validator for the resiliationDate
     * @param {Date} specifiedDate Date to validate
     */
    this.checkDate = function (specifiedDate) {
        return !specifiedDate || (validator.isDate(specifiedDate) && (specifiedDate >= self.minResiliationDate));
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
     * Compute the new price
     * @returns {*}
     */
    this.computePrice = function () {
        self.computingPrice = true;
        return OvhApiXdslResiliation.v6().resiliationTerms({
            serviceName: $stateParams.serviceName,
            resiliationDate: self.when ? self.when.toISOString() : null
        }).$promise.then(function (data) {
            if (data.due) {
                self.resiliationTerms.data.due = data.due;
            }
        }, function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.computingPrice = false;
        });
    };

    /**
     * Cancel an on-going resiliation
     * @param  {Object} service Service to cancel resiliation
     */
    this.cancelServiceResiliation = function (service) {
        self.loading = true;
        return OvhApiXdslResiliation.v6().cancelResiliation({
            serviceName: service.serviceName
        }, null).$promise.then(function () {
            self.init();
        }, function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading = false;
        });
    };

    this.init();
});
