angular.module("managerApp").controller("OrderOverTheBoxCtrl", function ($translate, $q, $scope, OvhApiOrderOverTheBoxNew, OvhApiPriceOverTheBoxOffer, OvhApiOverTheBox, Toast, ToastError, OvhApiMePaymentMean) {
    "use strict";

    var self = this;

    self.loaders = {
        durations: false,
        order: false,
        orders: false,
        create: false,
        checking: false
    };

    self.durations = [];
    self.offers = [];
    self.devices = [];
    self.hasDefaultPaymentMeans = false;

    // when true, the customer is proposed to attach a device before ordering a new service
    self.proposeLinkDevice = false;

    self.orderModel = {
        offer: null,
        duration: null,
        deviceId: null,
        voucher: null
    };

    self.states = {
        order: false,
        orderDone: false
    };

    function init () {
        self.checkPaymentMeans();
        self.checkDevices();
    }

    self.checkPaymentMeans = function () {
        self.paymentMeansChecking = false;
        return OvhApiMePaymentMean.v6().getDefaultPaymentMean().then(function (defaultPaymentMean) {
            self.hasDefaultPaymentMeans = !!defaultPaymentMean;
        }).finally(function () {
            self.paymentMeansChecking = false;
        });
    };

    self.checkDevices = function () {
        self.loaders.checking = true;
        return $q.all([
            OvhApiOverTheBox.v6().checkDevices().$promise.then(function (devices) {
                self.devices = devices;
                return devices;
            }, function (error) {
                self.error.checking = error.data;
                return new ToastError(error);
            }),
            OvhApiOverTheBox.Aapi().getServices().$promise.then(function (services) {
                self.services = services;
                self.unlinkedServices = services.filter(function (service) {
                    return !service.device;
                });
                return self.unlinkedServices;
            }, function (err) {
                return new ToastError(err);
            })
        ]).then(function () {
            self.orphanDevices = self.devices.filter(function (device) {
                var found = false;
                self.services.forEach(function (service) {
                    found = service.device.deviceId === device.deviceId ? true : found;
                });
                return !found;
            });
            self.proposeLinkDevice = (self.devices.length > 0) && (self.unlinkedServices.length > 0) ?
            {
                service: self.unlinkedServices[0],
                devices: self.orphanDevices.length === 1 ? self.orphanDevices[0] : null
            } : null;
        }).finally(function () {
            self.loaders.checking = false;
        });
    };

    self.startOrder = function () {
        return self.getOrderOffers().then(function (offers) {
            if (offers.length === 1) {
                self.orderModel.offer = offers[0];
                self.getOrderDurations().finally(function () {
                    self.states.order = true;
                });

                return offers;
            }
            self.states.order = true;
            return offers;
        });
    };

    self.getOrderOffers = function () {
        return OvhApiOverTheBox.v6().availableOffers().$promise.then(
            function (offers) {
                self.offers = offers;

                return offers;
            },
            function () {
                return new ToastError(null, "order_overTheBox_offers_error");
            }
        );
    };

    self.getOrderDurations = function () {
        self.loaders.durations = true;

        return OvhApiOrderOverTheBoxNew.v6().query({
            deviceId: self.orderModel.deviceId,
            offer: self.orderModel.offer,
            voucher: self.orderModel.voucher
        }).$promise.then(function (durations) {
            self.durations = durations;
            if (durations.length === 1) {
                self.orderModel.duration = self.durations[0];
            }
            if (self.devices.length === 1) {
                self.orderModel.deviceId = self.devices[0].deviceId;
            }

            return durations;
        }, function (error) {
            return new ToastError(error);
        }).finally(function () {
            self.loaders.durations = false;
        });
    };

    self.getOrder = function () {
        self.loaders.order = true;
        return OvhApiOrderOverTheBoxNew.v6().get({
            duration: self.orderModel.duration,
            deviceId: self.orderModel.deviceId,
            offer: self.orderModel.offer || "summit",
            voucher: self.orderModel.voucher
        }).$promise.then(function (informations) {
            self.orderInformations = informations;

            return informations;
        }, function (error) {
            return new ToastError(error);
        }).finally(function () {
            self.loaders.order = false;
        });
    };

    self.order = function () {
        self.loaders.create = true;
        return OvhApiOrderOverTheBoxNew.v6().save({
            duration: self.orderModel.duration
        }, {
            deviceId: self.orderModel.deviceId,
            offer: self.orderModel.offer,
            voucher: self.orderModel.voucher
        }).$promise.then(function (success) {
            self.bcUrl = success.url;
            self.states.order = false;
            self.states.orderDone = true;

            return success;
        }, function (error) {
            return new ToastError(error);
        }).finally(function () {
            self.loaders.create = false;
        });
    };

    $scope.$watchCollection(function () {
        return self.orderModel;
    }, function () {
        if (!self.loaders.order && self.orderModel.offer && self.orderModel.duration) {
            self.getOrder();
        }
    });

    init();

});
