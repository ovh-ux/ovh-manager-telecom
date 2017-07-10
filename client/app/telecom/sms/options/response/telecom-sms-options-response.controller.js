angular.module("managerApp").controller("TelecomSmsOptionsResponseCtrl", function ($q, $stateParams, $translate, $uibModal, Sms, SmsMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchEnums () {
        return SmsMediator.getApiScheme().then(function (schema) {
            return {
                smsResponseType: schema.models["sms.ResponseTypeEnum"].enum
            };
        });
    }

    function fetchService () {
        return Sms.Lexi().get({
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchSenders () {
        return Sms.Senders().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (sendersIds) {
            return $q.all(_.map(sendersIds, function (sender) {
                return Sms.Senders().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    sender: sender
                }).$promise;
            })).then(function (senders) {
                return _.filter(senders, { status: "enable" });
            });
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.hasChanged = function () {
        return !(
            self.service.smsResponse.responseType === self.smsResponse.responseType &&
            self.service.smsResponse.cgiUrl === self.smsResponse.cgiUrl &&
            self.service.smsResponse.text === self.smsResponse.text
        );
    };

    self.computeRemainingChar = function () {
        return _.assign(self.message, SmsMediator.getSmsInfoText(
            self.smsResponse.text,
            false // suffix
        ));
    };

    self.setResponseAction = function () {
        self.loading.action = true;

        return Sms.Lexi().edit({
            serviceName: $stateParams.serviceName
        }, {
            smsResponse: {
                cgiUrl: self.smsResponse.cgiUrl,
                responseType: self.smsResponse.responseType,
                text: self.smsResponse.text,
                trackingOptions: self.smsResponse.trackingOptions
            }
        }).$promise.then(function () {
            self.service.smsResponse = self.smsResponse;
            self.smsResponse = angular.copy(_.result(self.service, "smsResponse"));

            Toast.success($translate.instant("sms_options_response_action_status_success"));
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.action = false;
        });
    };

    self.addTrackingOptions = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/response/add/telecom-sms-options-response-add.html",
            controller: "TelecomSmsOptionsResponseAddCtrl",
            controllerAs: "OptionsResponseAddCtrl",
            resolve: {
                service: function () { return self.service; },
                senders: function () { return self.senders; }
            }
        });

        modal.result.then(function () {
            return fetchService().then(function (service) {
                self.service = angular.copy(service);
                self.smsResponse = angular.copy(_.result(self.service, "smsResponse"));
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_options_response_tracking_add_option_ko", { error: error.message }));
            }
        });

        return modal;
    };

    self.editTrackingOptions = function ($index, option) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/response/edit/telecom-sms-options-response-edit.html",
            controller: "TelecomSmsOptionsResponseEditCtrl",
            controllerAs: "OptionsResponseEditCtrl",
            resolve: {
                service: function () { return self.service; },
                senders: function () { return self.senders; },
                index: function () { return $index; },
                option: function () { return option; }
            }
        });

        modal.result.then(function () {
            return fetchService().then(function (service) {
                self.service = angular.copy(service);
                self.smsResponse = angular.copy(_.result(self.service, "smsResponse"));
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_options_response_tracking_edit_option_ko", { error: error.message }));
            }
        });

        return modal;
    };

    self.removeTrackingOptions = function ($index, option) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/response/remove/telecom-sms-options-response-remove.html",
            controller: "TelecomSmsOptionsResponseRemoveCtrl",
            controllerAs: "OptionsResponseRemoveCtrl",
            resolve: {
                service: function () { return self.service; },
                index: function () { return $index; },
                option: function () { return option; }
            }
        });

        modal.result.then(function () {
            return fetchService().then(function (service) {
                self.service = angular.copy(service);
                self.smsResponse = angular.copy(_.result(self.service, "smsResponse"));
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_options_response_tracking_remove_option_ko", { error: error.message }));
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading = {
            init: false,
            action: false
        };

        self.enums = {};

        self.service = null;

        self.smsResponse = {};

        self.senders = null;

        self.urlPattern = /^(https?):\/\/.*$/;

        self.message = {
            coding: "7bit",
            defaultSize: 160,
            remainingCharacters: null,
            equivalence: null, // number of SMS that will be sent
            maxlength: null,
            maxLengthReached: false
        };

        self.loading.init = true;
        return $q.all({
            enums: fetchEnums(),
            service: fetchService(),
            senders: fetchSenders()
        }).then(function (responses) {
            self.enums = responses.enums;

            // Reordered available responses
            // ["cgi", "none", "text"] => ["none", "cgi", "text"]
            self.enums.smsResponseType.splice(0, 0, self.enums.smsResponseType.splice(1, 1)[0]);
            self.service = angular.copy(responses.service);
            self.smsResponse = angular.copy(_.result(self.service, "smsResponse"));
            self.senders = responses.senders;
            self.computeRemainingChar();
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
