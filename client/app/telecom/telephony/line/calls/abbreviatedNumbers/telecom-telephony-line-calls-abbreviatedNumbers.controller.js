angular.module("managerApp").controller(
    "TelecomTelephonyLineCallsAbbreviatedNumbersCtrl",
    function ($q, $stateParams, $translate, Telephony, Toast, PAGINATION_PER_PAGE) {
        "use strict";

        var self = this;

        this.remove = function (abbreviatedNumber) {
            return Telephony.Line().AbbreviatedNumber().Lexi().remove({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                abbreviatedNumber: abbreviatedNumber.abbreviatedNumber
            }).$promise;
        };

        this.insert = function (abbreviatedNumber) {
            return Telephony.Line().AbbreviatedNumber().Lexi().insert({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, abbreviatedNumber).$promise;
        };

        this.update = function (abbreviatedNumber) {
            return Telephony.Line().AbbreviatedNumber().Lexi().update({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName,
                abbreviatedNumber: abbreviatedNumber.abbreviatedNumber
            }, _.pick(abbreviatedNumber, ["destinationNumber", "name", "surname"])).$promise;
        };

        this.load = function () {
            this.loading = {
                init: true
            };
            this.abbreviatedNumbers = [];
            return Telephony.Line().AbbreviatedNumber().Aapi().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(
                function (abbreviatedNumbers) {
                    self.abbreviatedNumbers = _.sortBy(abbreviatedNumbers, "abbreviatedNumber");
                },
                function () {
                    Toast.error($translate.instant("telephony_line_actions_line_calls_abbreviated_numbers_read_error"));
                }
            ).finally(function () {
                delete self.loading.init;
            });
        };

        function init () {
            self.pattern = {
                regexp: /^2\d{2,3}$/,
                errorMessage: $translate.instant("telephony_line_actions_line_calls_abbreviated_numbers_pattern_error")
            };
            self.filter = {
                perPage: PAGINATION_PER_PAGE
            };
            return $q.all([
                Telephony.Line().Lexi().get({
                    billingAccount: $stateParams.billingAccount,
                    serviceName: $stateParams.serviceName
                }).$promise.then(
                    function (detail) {
                        self.exportFilename = "ab_num_" + (detail.description || $stateParams.serviceName) + ".csv";
                    },
                    function () {
                        self.exportFilename = "ab_num_" + $stateParams.serviceName + ".csv";
                    }
                ),
                self.load()
            ]);
        }

        init();
    }
);
