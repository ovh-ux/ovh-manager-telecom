angular.module("managerApp").controller("TelecomTelephonyLineCallsDisplayNumberCtrl", function ($q, $stateParams, $translate, TelephonyLineOptions, TelephonyNumber, Toast, ToastError) {
    "use strict";

    var self = this;

    /**
     * Update displayNumber
     * @param {String} newNum New display number
     * @returns {Promise}
     */
    this.update = function (newNum) {
        var data = {
            identificationRestriction: self.identificationRestriction
        };

        if (!self.identificationRestriction) {
            data.displayNumber = newNum.serviceName;
        }

        return TelephonyLineOptions.Lexi().update(
            {
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, data).$promise.then(
            function (result) {
                Toast.success($translate.instant("telephony_line_actions_line_calls_display_number_write_success"));
                self.saved = self.current;
                return result;
            }, function (err) {
                ToastError($translate.instant("telephony_line_actions_line_calls_display_number_write_error"));
                return $q.reject(err);
            }
        );
    };

    function getCurrentDisplayNumber () {
        return TelephonyLineOptions.Lexi().get({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (options) {
            self.options = _.isObject(options) ? options : {};
            return options;
        }, function () {
            return new ToastError($translate.instant("telephony_line_actions_line_calls_display_number_read_error"));
        });
    }

    function getAliases () {
        return TelephonyNumber.Aapi().query({
            billingAccount: $stateParams.billingAccount
        }).$promise.then(function (aliases) {
            self.numbers = _.uniq(
                _.filter(
                    aliases,
                    function (elt) {
                        return ["fax", "line", "alias"].indexOf(elt.type) > -1;
                    }
                ),
                "serviceName"
            );
        }, function () {
            self.numbers = [];
            return new ToastError($translate.instant("telephony_line_actions_line_calls_display_number_read_error"));
        });
    }

    /**
     * Initialize the controller by readind the display number
     * @returns {Promise}
     */
    function init () {

        self.numbers = [];
        self.updating = true;

        return $q.all([
            getAliases(),
            getCurrentDisplayNumber()
        ]).then(null, function () {
            if (!self.numbers.length) {
                self.numbers.push({
                    serviceName: self.options && self.options.displayNumber ? self.options.displayNumber : $stateParams.serviceName
                });
            }
        }).finally(function () {
            self.numbers.forEach(function (detail) {
                detail.label = detail.serviceName + (detail.serviceName !== detail.description ? " (" + detail.description + ")" : "");
            });
            self.current = _.find(
                self.numbers,
                {
                    serviceName: self.options && self.options.displayNumber ? self.options.displayNumber : $stateParams.serviceName
                }
            );
            self.identificationRestriction = self.options.identificationRestriction;
            self.saved = self.current;
            self.updating = false;
        });
    }

    init();
});
