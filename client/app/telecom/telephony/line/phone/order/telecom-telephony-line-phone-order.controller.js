angular.module("managerApp").controller("TelecomTelephonyLinePhoneOrderCtrl", function ($q, $scope, $stateParams, $translate, IpAddress, TelephonyMediator, OvhApiTelephony, OvhApiOrder, Toast, ToastError, TELEPHONY_RMA) {
    "use strict";

    var self = this;

    self.pdfBaseUrl = TELEPHONY_RMA.pdfBaseUrl;
    self.rmaStatusUrl = TelephonyMediator.getV6ToV4RedirectionUrl("line.line_sav_rma_status");

    function fetchOfferPhones (offer) {
        return OvhApiTelephony.v6().getLineOfferPhones({
            country: "fr",
            offer: offer
        }).$promise;
    }

    function fetchMerchandiseAvailable () {
        return OvhApiTelephony.Line().Phone().v6().getMerchandiseAvailable({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise.then(function (result) {
            _.each(result, function (phone) {
                var parts = (phone.name || "").split(/\./);
                phone.displayName = _.capitalize(_.head(parts)) + " " + parts.slice(1).map(function (p) {
                    return (p || "").toUpperCase();
                }).join(" ");
            });
            return _.filter(result, function (phone) {
                return phone.price && phone.price.value >= 0;
            });
        }).then(function (result) {
            return fetchOfferPhones(self.line.getPublicOffer.name).then(function (offers) {
                _.each(offers, function (offer) {
                    var found = _.find(result, { name: offer.brand });
                    if (found) {
                        found.displayName = offer.description;
                    }
                });
                return result;
            });
        });
    }

    function fetchOrder (order) {
        var params = {
            serviceName: $stateParams.serviceName,
            hardware: order.phone,
            retractation: order.retract,
            shippingContactId: order.contact.id
        };
        if (_.get(order, "shipping.mode") === "mondialRelay") {
            params.mondialRelayId = order.shipping.relay.id;
        }
        self.isFetchingOrder = true;
        return OvhApiOrder.Telephony().v6().getHardware(params).$promise.finally(function () {
            self.isFetchingOrder = false;
        });
    }

    function filterContact (contacts) {
        return _.chain(contacts).groupBy(function (contact) { // group contact to detect contact that are the same
            var contactCopy = {
                lastName: contact.lastName,
                firstName: contact.firstName
            };
            if (contact.address) {
                contactCopy.address = {
                    country: contact.address.country,
                    line1: contact.address.line1,
                    zip: contact.address.zip,
                    city: contact.address.city
                };
            }
            return JSON.stringify(contactCopy);
        }).map(function (groups) { // get only contacts that are unique
            return _.first(groups);
        }).filter(function (contact) { // filter contact that have id and are in given countries
            return _.get(contact, "address") && ["BE", "FR", "CH"].indexOf(contact.address.country) > -1;
        }).value();
    }

    function init () {

        self.orderStep = "hardware";

        self.order = {
            contact: null,
            phone: null,
            summary: null,
            rmas: [],
            shipping: {
                mode: null,
                relay: null,
                options: {
                    shippingPrice: 0
                }
            },
            retract: true,
            isContractsAccepted: false,
            url: null,
            success: false,
            orderURL: null
        };

        self.contactChoiceOptions = {
            filter: filterContact
        };

        self.macAddress = null;
        self.line = null;
        self.phone = null;
        self.phoneOffers = null;
        self.billingAccount = $stateParams.billingAccount;
        self.serviceName = $stateParams.serviceName;
        self.hasPendingOfferTasks = false;

        self.isLoading = true;
        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);
        }).then(function () {
            return OvhApiTelephony.Line().v6().get({
                billingAccount: self.line.billingAccount,
                serviceName: self.line.serviceName
            }).$promise.then(function (result) {
                _.assign(self.line, { getPublicOffer: result.getPublicOffer }, { isAttachedToOtherLinesPhone: result.isAttachedToOtherLinesPhone });
            });
        }).then(function () {
            return self.line.hasPendingOfferTasks();
        }).then(function (hasPendingOfferTasks) {
            self.hasPendingOfferTasks = hasPendingOfferTasks;
            return self.line.getPhone();
        }).then(function (phone) {
            self.phone = phone;
            if (phone) {
                return phone.getRMAs().then(function (rmas) {
                    self.rmas = rmas;
                }).then(function () {
                    self.isStepLoading = true;
                    fetchMerchandiseAvailable().then(function (result) {
                        self.merchandise = result;
                    }).catch(function (err) {
                        return new ToastError(err);
                    }).finally(function () {
                        self.isStepLoading = false;
                    });
                });
            }
            self.rmas = [];
            return fetchOfferPhones(self.line.getPublicOffer.name).then(function (offers) {
                self.phoneOffers = offers;
                if (offers.length) {
                    self.order.phone = _.first(offers).brand;
                }
            });

        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isLoading = false;
        });

        $scope.$watch("PhoneOrderCtrl.orderStep", function (step) {
            switch (step) {
            case "hardware":
                if (self.phone) {
                    self.isStepLoading = true;
                    fetchMerchandiseAvailable().then(function (result) {
                        self.merchandise = result;
                    }).catch(function (err) {
                        return new ToastError(err);
                    }).finally(function () {
                        self.isStepLoading = false;
                    });
                } else if (self.line && self.line.getPublicOffer) {
                    fetchOfferPhones(self.line.getPublicOffer.name).then(function (offers) {
                        self.phoneOffers = offers;
                    }).catch(function (err) {
                        return new ToastError(err);
                    }).finally(function () {
                        self.isStepLoading = false;
                    });
                }
                break;
            case "summary":
                self.isStepLoading = true;
                self.order.isContractsAccepted = false;
                fetchOrder(self.order).then(function (result) {
                    self.order.summary = result;
                }).catch(function (err) {
                    return new ToastError(err);
                }).finally(function () {
                    self.isStepLoading = false;
                });
                break;
            default:
                break;
            }
        });
    }

    self.submitPhoneReturn = function () {
        self.isSubmiting = true;
        return OvhApiTelephony.Line().Phone().RMA().v6().post({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            type: "restitution but keep the service enable" // nice enum ...
        }).$promise.then(function () {
            return self.phone.getRMAs();
        }).then(function (rmas) {
            self.rmas = rmas;
            self.returnSuccess = true;
            self.orderStep = "hardware"; // reset form
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isSubmiting = false;
        });
    };

    self.submitOrder = function () {
        if (self.phone) {
            return self.submitRma();
        }
        var params = {
            hardware: self.order.phone,
            retractation: self.order.retract
        };
        if (_.get(self.order, "shipping.mode") === "mondialRelay") {
            params.mondialRelayId = self.order.shipping.relay.id;
        } else {
            params.shippingContactId = self.order.contact.id;
        }
        self.isSubmiting = true;
        return OvhApiOrder.Telephony().v6().orderHardware({
            serviceName: $stateParams.serviceName
        }, params).$promise.then(function (order) {
            self.order.success = true;
            self.order.orderURL = order.url;
            self.orderStep = "hardware"; // reset form
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isSubmiting = false;
        });

    };

    self.submitRma = function () {
        var params = {
            newMerchandise: self.order.phone,
            type: "change to another phone/equipment (restitution first and shipping then)" // nice enum ...
        };

        if (_.get(self.order, "shipping.mode") === "mondialRelay") {
            params.mondialRelayId = self.order.shipping.relay.id;
        } else {
            params.shippingContactId = self.order.contact.id;
        }

        self.isSubmiting = true;
        return OvhApiTelephony.Line().Phone().RMA().v6().post({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, params).$promise.then(function () {
            return self.phone.getRMAs();
        }).then(function (rmas) {
            self.rmas = rmas;
            self.order.success = true;
            self.orderStep = "hardware"; // reset form
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.isSubmiting = false;
        });
    };

    self.getPhoneLabel = function (phone) {
        var name = $translate.instant("telephony_line_phone_order_order_change_for", { phone: phone.displayName });
        var price = $translate.instant("telephony_line_phone_order_order_price_tax_free", { price: phone.price.text });
        return [name, price].join(" ");
    };

    self.getOfferLabel = function (offer) {
        var name = $translate.instant("telephony_line_phone_order_order_a", { brand: offer.description });
        var price = $translate.instant("telephony_line_phone_order_order_price2_tax_free", { price: offer.price.text });
        return [name, price].join(" ");
    };

    self.isSamePhone = function () {
        return self.phone && self.order.phone && ("phone." + self.order.phone) === self.phone.brand;
    };

    self.ipValidator = (function () {
        return {
            test: function (value) {
                return IpAddress.isValidPublicIp4(value);
            }
        };
    })();

    self.detachPhone = function () {
        self.isDetaching = true;
        OvhApiTelephony.Line().v6().dissociateDevice({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }, {
            ipAddress: self.attachedPhoneIpAddress,
            macAddress: self.phone.macAddress
        }).$promise.then(function () {
            Toast.success($translate.instant("telephony_line_phone_order_detach_device_success"));

            // Cache reset
            OvhApiTelephony.Line().v6().resetAllCache();
            OvhApiTelephony.Line().Phone().v6().resetAllCache();
            TelephonyMediator.resetAllCache();
            init();
        }).catch(function (err) {
            Toast.error([$translate.instant("telephony_line_phone_order_detach_device_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.isDetaching = false;
        });
    };

    init();
});
