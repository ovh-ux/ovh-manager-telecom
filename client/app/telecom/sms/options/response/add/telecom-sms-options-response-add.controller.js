angular.module("managerApp").controller("TelecomSmsOptionsResponseAddCtrl",
                                        function ($q, $stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, service, senders, ToastError) {
                                            "use strict";

                                            var self = this;

                                            self.loading = {
                                                init: false,
                                                addTrackingOption: false
                                            };

                                            self.added = false;

                                            self.service = angular.copy(service);
                                            self.senders = angular.copy(senders);

                                            self.availableTrackingMedia = [];
                                            self.trackingOptions = {};

                                            self.targetNumberPattern = /^(\+|0{2}?)\d+$/;

                                            /*= ==============================
    =            ACTIONS            =
    ===============================*/

                                            self.resetTrackingOptions = function () {
                                                self.trackingOptions.sender = self.trackingOptions.target = "";
                                            };

                                            self.handleTrackingSenderNumber = function () {
                                                self.trackingOptions.sender = _.has(self.trackingSender, "sender") ? self.trackingSender.sender : "";
                                            };

                                            self.restrictTargetNumber = function () {
                                                if (self.trackingOptions.target) {
                                                    self.trackingOptions.target = self.trackingOptions.target.replace(/[^0-9\+]/g, "");
                                                }
                                            };

                                            self.add = function () {
                                                self.loading.addTrackingOption = true;
                                                self.service.smsResponse.trackingOptions.push(self.trackingOptions);

                                                return $q.all([
                                                    Sms.Lexi().edit({
                                                        serviceName: $stateParams.serviceName
                                                    }, {
                                                        smsResponse: {
                                                            trackingOptions: self.service.smsResponse.trackingOptions,
                                                            responseType: self.service.smsResponse.responseType
                                                        }
                                                    }).$promise,
                                                    $timeout(angular.noop, 1000)
                                                ]).then(function () {
                                                    self.loading.addTrackingOption = false;
                                                    self.added = true;

                                                    return $timeout(self.close, 1000);
                                                }, function (error) {
                                                    return self.cancel({
                                                        type: "API",
                                                        message: error.data.message
                                                    });
                                                });
                                            };

                                            self.cancel = function (message) {
                                                return $uibModalInstance.dismiss(message);
                                            };

                                            self.close = function () {
                                                return $uibModalInstance.close(true);
                                            };

                                            /* -----  End of ACTIONS  ------*/

                                            /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

                                            function init () {
                                                self.loading.init = true;

                                                return SmsMediator.initDeferred.promise.then(function () {
                                                    return SmsMediator.getApiScheme().then(function (schema) {
                                                        self.availableTrackingMedia = _.pull(schema.models["sms.ResponseTrackingMediaEnum"].enum, "voice");
                                                        return self.availableTrackingMedia;
                                                    });
                                                }).catch(function (err) {
                                                    return new ToastError(err);
                                                }).finally(function () {
                                                    self.loading.init = false;
                                                });
                                            }

                                            /* -----  End of INITIALIZATION  ------*/

                                            init();
                                        });
