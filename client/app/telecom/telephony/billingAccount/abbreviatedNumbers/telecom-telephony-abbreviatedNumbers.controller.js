angular.module("managerApp").controller(
    "TelecomTelephonyAbbreviatedNumbersCtrl",
    function ($q, $stateParams, $translate, OvhApiTelephony, Toast, PAGINATION_PER_PAGE) {
        "use strict";

        var self = this;

        this.remove = function (abbreviatedNumber) {
            return OvhApiTelephony.AbbreviatedNumber().v6().remove({
                billingAccount: $stateParams.billingAccount,
                abbreviatedNumber: abbreviatedNumber.abbreviatedNumber
            }).$promise;
        };

        this.insert = function (abbreviatedNumber) {
            return OvhApiTelephony.AbbreviatedNumber().v6().insert({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }, abbreviatedNumber).$promise;
        };

        this.update = function (abbreviatedNumber) {
            return OvhApiTelephony.AbbreviatedNumber().v6().update({
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
            return OvhApiTelephony.AbbreviatedNumber().Aapi().query({
                billingAccount: $stateParams.billingAccount
            }).$promise.then(
                function (abbreviatedNumbers) {
                    self.abbreviatedNumbers = _.sortBy(abbreviatedNumbers, "abbreviatedNumber");
                },
                function () {
                    Toast.error($translate.instant("telephony_abbreviated_numbers_read_error"));
                }
            ).finally(function () {
                delete self.loading.init;
            });
        };

        function init () {
            self.pattern = {
                regexp: /^7\d{2,3}$/,
                errorMessage: $translate.instant("telephony_abbreviated_numbers_pattern_error")
            };
            self.filter = {
                perPage: PAGINATION_PER_PAGE
            };

            return $q.all([
                OvhApiTelephony.v6().get({ billingAccount: $stateParams.billingAccount }).$promise.then(
                    function (detail) {
                        self.exportFilename = "ab_num_" + (detail.description || $stateParams.billingAccount) + ".csv";
                    },
                    function () {
                        self.exportFilename = "ab_num_" + $stateParams.billingAccount + ".csv";
                    }
                ),
                self.load()
            ]);
        }

        init();
    }
);
