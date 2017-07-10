angular.module("managerApp").controller("TelecomSmsOptionsResponseEditCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, service, senders, index, option, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        editTrackingOption: false
    };

    self.edited = false;

    self.service = angular.copy(service);
    self.senders = angular.copy(senders);
    self.index = index;
    self.option = angular.copy(option);

    self.availableTrackingMedia = [];
    self.trackingOptions = {};
    self.trackingSender = {};

    self.targetNumberPattern = /^\+?[\d+]{8,14}$/;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.resetTrackingOptions = function () {
        self.option.sender = self.option.target = "";
    };

    self.edit = function () {
        self.loading.editTrackingOption = true;
        self.service.smsResponse.trackingOptions[self.index] = {
            media: self.trackingOptions.media,
            sender: self.trackingSender.sender,
            target: self.option.target
        };

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
            self.loading.editTrackingOption = false;
            self.edited = true;

            return $timeout(self.close, 1000);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
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
                self.trackingOptions.media = self.option.media;
                self.trackingSender.sender = self.option.sender;
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
