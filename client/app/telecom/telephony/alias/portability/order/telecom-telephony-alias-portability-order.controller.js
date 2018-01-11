angular.module("managerApp").controller("TelecomTelephonyAliasPortabilityOrderCtrl", function ($scope, $stateParams, $translate, $q, moment, TelephonyMediator, OvhApiMe, OvhApiOrder, Toast, ToastError) {
    "use strict";

    var self = this;

    // attributes shared by 'individual' and 'company' social reason
    var sharedAttributes = [
        "billingAccount", "building", "callNumber", "city", "comment", "contactName",
        "contactNumber", "country", "desireDate", "displayUniversalDirectory", "door",
        "firstName", "floor", "groupNumber", "lineToRedirectAliasTo", "name", "offer",
        "socialReason", "stair", "streetName", "streetNumber", "streetNumberExtra",
        "streetType", "type", "zip"
    ];

    function init () {

        self.order = {
            // default values
            type: "landline",
            sdatype: "all",
            socialReason: "individual",
            country: "france",
            contactNumber: "",
            translatedCountry: $translate.instant("telephony_alias_portability_order_contact_country_france"),
            displayUniversalDirectory: false,
            numbersList: [],
            success: false,
            autoPay: false,
            addressTooLong: false
        };

        self.stepsList = ["number", "contact", "config", "summary"];
        self.step = "number";
        self.minDate = moment().add(15, "days").toDate();
        self.order.desireDate = moment(self.minDate).toDate();
        self.desireDatePickerOpened = false;
        self.isSDA = false;

        // reset contract when step changes
        $scope.$watch("PortabilityOrderCtrl.step", function () {
            self.order.isContractsAccepted = false;
        });

        $scope.$watch("PortabilityOrderCtrl.order", function () {
            self.order.contactName = self.order.name;
            self.onNumberChange();
        }, true);

        $scope.$watch("PortabilityOrderCtrl.isSDA", function () {
            self.order.offer = self.isSDA ? "company" : "individual";
        }, true);

        // fetch list of billing accounts
        return TelephonyMediator.getAll().then(function (groups) {
            self.billingAccounts = groups;
            self.order.billingAccount = $stateParams.billingAccount;
        }).catch(function (err) {
            return new ToastError(err);
        });
    }

    self.openDesireDatePicker = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        self.desireDatePickerOpened = true;
    };

    // select number corresponding country automatically
    self.onNumberChange = function () {
        var number = self.normalizeNumber(self.order.callNumber);
        if (_.startsWith(number, "0033")) {
            self.order.country = "france";
        } else if (_.startsWith(number, "0032")) {
            self.order.country = "belgium";
            self.order.rio = null;
        } else if (_.startsWith(number, "0041")) {
            self.order.country = "switzerland";
            self.order.rio = null;
        }
        self.order.translatedCountry = $translate.instant("telephony_alias_portability_order_contact_country_" + self.order.country);
    };

    self.onChooseRedirectToLine = function (result) {
        self.order.lineToRedirectAliasTo = result.serviceName;
        self.order.lineToRedirectAliasToDescription = result.description;
    };

    // add sdaNumberToAdd number to numbersList
    self.addSdaNumber = function () {
        self.order.numbersList.push(self.order.sdaNumberToAdd);
        self.order.numbersList = _.uniq(self.order.numbersList);
        self.order.sdaNumberToAdd = null;
    };

    // remove given number from numbersList
    self.removeSdaNumber = function (number) {
        self.order.numbersList = _.pull(self.order.numbersList, number);
    };

    // normalize number : replace +33 by 0033
    self.normalizeNumber = function (numberParam) {
        var number = numberParam;
        if (number) {
            number = number.replace(/^\+/, "00");
        }
        return number;
    };

    self.goToConfigStep = function () {
        self.order.addressTooLong = false;

        if ((_.get(self.order, "streetName", "").length + _.get(self.order, "streetNumber", "").length + _.get(self.order, "streetNumberExtra", "").length + _.get(self.order, "streetType", "").length) >= 35) {
            self.order.addressTooLong = true;
            return false;
        }

        self.step = "config";
        return true;
    };

    self.getOrderParams = function () {
        var params = _.pick(self.order, sharedAttributes);

        if (params.socialReason === "individual") {
            params = _.assign(params, _.pick(self.order, "rio"));
        } else {
            params = _.assign(params, _.pick(self.order, "siret"));
            params.firstName = "";
        }

        if (self.isSDA && self.order.sdatype === "select" && self.order.numbersList.length) {
            params.listNumbers = _.map(self.order.numbersList, self.normalizeNumber).join(",");
        }

        params.callNumber = self.normalizeNumber(params.callNumber);
        params.contactNumber = self.normalizeNumber(params.contactNumber);
        params.desireDate = moment(params.desireDate).format("Y-MM-DD");

        return params;
    };

    self.fetchPriceAndContracts = function () {
        self.step = "summary";
        return OvhApiOrder.Telephony().Lexi().getPortability(self.getOrderParams()).$promise.then(function (result) {
            self.details = result.details;
            self.contracts = result.contracts;
            self.prices = result.prices;
        }).catch(function (err) {
            self.step = "number";
            return new ToastError(err);
        });
    };

    self.submitOrder = function () {
        self.order.isOrdering = true;
        return OvhApiOrder.Telephony().Lexi().orderPortability({
            billingAccount: self.order.billingAccount
        }, _.omit(self.getOrderParams(), "billingAccount")).$promise.then(function (result) {
            self.order.success = true;
            self.order.url = result.url;
            return OvhApiMe.Order().Lexi().get({
                orderId: result.orderId
            }).$promise.then(function () {
                // in this case it's allowed to auto pay order
                return OvhApiMe.Order().Lexi().payRegisteredPaymentMean({
                    orderId: result.orderId
                }, {
                    paymentMean: "ovhAccount"
                }).$promise.then(function () {
                    self.order.autoPay = true;
                }, function () {
                    // if it fails no need to reject because portablity order is a success and validation can always be done by clicking
                    self.order.autoPay = false;
                });
            }, function () {
                // in this case it means that nic bill and connected are not the same
                // so display a message telling that order must be validated by clicking
                // no need to reject because portablity order is a success and validation can always be done by clicking
                self.order.autoPay = false;
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_alias_portability_order_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.order.isOrdering = false;
        });
    };

    init();
});
