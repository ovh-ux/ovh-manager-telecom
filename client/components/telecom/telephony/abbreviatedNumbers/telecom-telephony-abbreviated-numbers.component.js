angular.module("managerApp").component("telecomTelephonyAbbreviatedNumbers", {
    bindings: {
        abbreviatedNumbers: "=?",
        abbreviatedNumberPattern: "=?",
        loading: "=?",
        exportFilename: "=?",
        removeCallback: "&",
        insertCallback: "&",
        updateCallback: "&",
        reloadCallback: "&"
    },
    templateUrl: "components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.html",
    controller: function ($uibModal, $q, $stateParams, $translate, $timeout, Toast, PAGINATION_PER_PAGE) {
        "use strict";

        var self = this;

        this.$onInit = function () {
            self.filter = {
                perPage: PAGINATION_PER_PAGE
            };
            self.loading = {
                init: true
            };
            self.abbreviatedNumbers = [];
        };


        /**
         * Remove an abbreviated number from the list
         * @param  {Object} abbreviatedNumber Full object
         * @return {Promise}
         */
        this.remove = function (abbreviatedNumber) {
            abbreviatedNumber.removing = true;
            return $q.when(this.removeCallback({ value: abbreviatedNumber })).then(
                function () {
                    Toast.success($translate.instant("telephony_abbreviated_numbers_remove_success", abbreviatedNumber));
                    _.remove(self.abbreviatedNumbers, { abbreviatedNumber: abbreviatedNumber.abbreviatedNumber });
                    return abbreviatedNumber;
                },
                function (err) {
                    Toast.error($translate.instant("telephony_abbreviated_numbers_remove_error", abbreviatedNumber));
                    return $q.reject(err);
                }
            ).finally(function () {
                delete abbreviatedNumber.removing;
            });
        };

        /**
         * Add a new abbreviated number
         */
        this.add = function () {
            var addModalInstance = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.modal.html",
                controller: "telecomTelephonyAbbreviatedNumbersModal",
                controllerAs: "AbbreviatedNumberModal",
                resolve: {
                    data: function () {
                        return {
                            // data: {},
                            pattern: self.abbreviatedNumberPattern,
                            saveCallback: self.insertCallback,
                            title: $translate.instant("telephony_abbreviated_numbers_insert_title")
                        };
                    }
                }
            });
            addModalInstance.result.then(function (data) {
                self.abbreviatedNumbers.push(data);
                self.abbreviatedNumbers = _.sortBy(self.abbreviatedNumbers, function (elt) {
                    return parseInt(elt.abbreviatedNumber, 10);
                });
            });
        };

        /**
         * Open the import dialog
         */
        this.openImport = function () {
            var importModalInstance = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/abbreviatedNumbers/import/telecom-telephony-abbreviated-numbers-import.modal.html",
                controller: "telecomTelephonyAbbreviatedNumbersImportModal",
                controllerAs: "AbbreviatedNumberModal",
                resolve: {
                    data: function () {
                        return {
                            pattern: self.abbreviatedNumberPattern,
                            saveCallback: self.insertCallback
                        };
                    }
                }
            });
            importModalInstance.result.then(function (data) {
                self.abbreviatedNumbers = _.sortBy(self.abbreviatedNumbers.concat(data), function (elt) {
                    return parseInt(elt.abbreviatedNumber, 10);
                });
            });
            importModalInstance.result.catch(function () {
                self.reloadCallback();
            });
        };

        /**
         * Open the "Trash All" dialog
         */
        this.trashAll = function () {
            var importModalInstance = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/abbreviatedNumbers/empty/telecom-telephony-abbreviated-numbers-empty.modal.html",
                controller: "telecomTelephonyAbbreviatedNumbersEmptyModal",
                controllerAs: "AbbreviatedNumberModal",
                resolve: {
                    data: function () {
                        return {
                            abbreviatedNumbers: self.abbreviatedNumbers,
                            removeCallback: self.removeCallback
                        };
                    }
                }
            });
            importModalInstance.result.then(function () {
                self.reloadCallback();
            });
            importModalInstance.result.catch(function () {
                self.reloadCallback();
            });
        };

        /**
         * Get the header line of the CSV
         */
        this.getCsvHeader = function () {
            return {
                abbreviatedNumber: $translate.instant("telephony_abbreviated_numbers_id"),
                destinationNumber: $translate.instant("telephony_abbreviated_numbers_number"),
                name: $translate.instant("telephony_abbreviated_numbers_name"),
                surname: $translate.instant("telephony_abbreviated_numbers_surname")
            };
        };

        /**
         * Get the order of fields in the CSV
         */
        this.getCsvOrder = function () {
            return ["abbreviatedNumber", "destinationNumber", "name", "surname"];
        };

        /**
         * Update an abbreviated number
         * @param  {Object} abbreviatedNumber Abbreviated number to update
         */
        this.update = function (abbreviatedNumber) {
            abbreviatedNumber.updating = true;
            var addModalInstance = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/abbreviatedNumbers/telecom-telephony-abbreviated-numbers.modal.html",
                controller: "telecomTelephonyAbbreviatedNumbersModal",
                controllerAs: "AbbreviatedNumberModal",
                resolve: {
                    data: function () {
                        return {
                            data: angular.copy(abbreviatedNumber),
                            readOnly: {
                                abbreviatedNumber: true
                            },
                            pattern: self.abbreviatedNumberPattern,
                            saveCallback: self.updateCallback,
                            title: $translate.instant("telephony_abbreviated_numbers_update_title")
                        };
                    }
                }
            });
            addModalInstance.result.then(function (data) {
                angular.extend(abbreviatedNumber, _.pick(data, ["name", "surname", "destinationNumber"]));
            }).finally(function () {
                delete abbreviatedNumber.updating;
            });
        };

    }
});
