angular.module("managerApp").component("telecomTelephonyCallsFilteringAdd", {
    bindings: {
        addScreenList: "&", // function to add a given screen
        getScreenList: "&", // function to retrieve the list of existing screens
        onScreenListAdded: "&?", // callback for when one or multiple screens have been added
        disableOutgoing: "@",
        disableNature: "@"
    },
    templateUrl: "components/telecom/telephony/callsFiltering/telecom-telephony-callsFilteringAdd.html",
    controller: function ($q, $translate, $translatePartialLoader, $uibModal, Toast, ToastError, CSVParser) {
        "use strict";

        var self = this;

        self.screenListToAdd = {
            nature: "international",
            type: "incomingWhiteList",
            callNumber: ""
        };

        self.isAdding = false;

        self.$onInit = function () {
            self.isInitialized = false;
            $translatePartialLoader.addPart("../components/telecom/telephony/callsFiltering");
            return $translate.refresh().finally(function () {
                self.isInitialized = true;
            });
        };

        self.addScreen = function (form) {
            self.isAdding = true;
            if (self.screenListToAdd.callNumber === null) {
                self.screenListToAdd.callNumber = "";
            }
            if (self.isScreenListsAlreadyExisting()) {
                return $q.when(false);
            }
            return self.addScreenList({
                screen: self.screenListToAdd
            }).then(function () {
                if (self.onScreenListAdded) {
                    self.onScreenListAdded();
                }
                form.$setPristine();
                self.screenListToAdd.callNumber = "";
                Toast.success($translate.instant("telephony_calls_filtering_add_success"));
            }).catch(function (err) {
                return new ToastError(err);
            }).finally(function () {
                self.isAdding = false;
            });
        };

        self.isScreenListsAlreadyExisting = function () {
            var list = self.getScreenList();
            var found = _.find(list, {
                callNumber: self.screenListToAdd.callNumber || "",
                nature: self.screenListToAdd.nature,
                type: self.screenListToAdd.type
            });

            // try to find the screenlist by modifying callNumber because +123 === 00123
            if (!found && self.screenListToAdd.callNumber) {
                var modifiedCallNumber = self.screenListToAdd.callNumber;
                if (_.startsWith(self.screenListToAdd.callNumber, "+")) {
                    modifiedCallNumber = "00" + self.screenListToAdd.callNumber.slice(1);
                } else if (_.startsWith(self.screenListToAdd.callNumber, "00")) {
                    modifiedCallNumber = "+" + self.screenListToAdd.callNumber.slice(2);
                }
                if (modifiedCallNumber !== self.screenListToAdd.callNumber) {
                    found = _.find(list, {
                        callNumber: modifiedCallNumber,
                        nature: self.screenListToAdd.nature,
                        type: self.screenListToAdd.type
                    });
                }
            }
            return angular.isDefined(found) && found.status !== "delete";
        };


        self.checkValidCSV = function (file) {
            var fileName = file ? file.name : "";
            var found = _.endsWith(fileName, "csv");
            if (!found) {
                ToastError($translate.instant("telephony_calls_filtering_add_csv_invalid"));
            }
            return found;
        };

        self.importCSV = function (csvData) {
            var csvArray = null;
            try {
                csvArray = CSVParser.parse(csvData);

                // check if csv header is valid otherwise raise an error
                if (!angular.equals(csvArray[0], ["callNumber", "nature", "type"])) {
                    throw new Error("Invalid CSV header");
                }
                csvArray = csvArray.slice(1); // trim header
            } catch (err) {
                return $q.when(new ToastError($translate.instant("telephony_calls_filtering_add_csv_parse_error"), err));
            }
            Toast.info($translate.instant("telephony_calls_filtering_add_csv_import_success"));
            return $q.all(_.map(csvArray, function (line) {
                return self.addScreenList({
                    screen: {
                        callNumber: line[0],
                        nature: line[1],
                        type: line[2]
                    }
                });
            })).then(function () {
                if (self.onScreenListAdded) {
                    self.onScreenListAdded();
                }
            }).catch(function (err) {
                return new ToastError(err);
            });
        };

        self.getNumberValidationPattern = (function () {
            var shortNumber = /^[0-9]+$/;
            var internationalNumber = /^(\+|00)[0-9]+$/;
            var validAll = /.*/;
            return function () {
                if (self.disableNature) {
                    return validAll;
                }
                return self.screenListToAdd.nature === "special" ? shortNumber : internationalNumber;
            };
        })();

        self.openHelper = function () {
            self.helperModalOpened = true;
            var modal = $uibModal.open({
                animation: true,
                templateUrl: "components/telecom/telephony/callsFiltering/addHelper/telecom-telephony-callsFilteringAddHelper.html",
                controller: "TelecomTelephonyCallsFilteringAddHelperCtrl",
                controllerAs: "FilteringHelperCtrl",
                resolve: {
                    param: function () {
                        return {
                            addScreenList: self.addScreenList,
                            disableOutgoing: self.disableOutgoing
                        };
                    }
                }
            });
            modal.result.then(function () {
                if (self.onScreenListAdded) {
                    self.onScreenListAdded();
                }
            }).finally(function () {
                self.helperModalOpened = false;
            });
            return modal;
        };
    }
});
