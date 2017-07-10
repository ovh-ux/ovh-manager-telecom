angular.module("managerApp").controller("TelecomSmsOptionsRecreditCtrl", function ($q, $stateParams, $uibModal, $translate, Sms, SmsMediator, OrderSms, Toast, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        price: false
    };

    self.service = null;

    function fetchOfferPrice (service) {
        if (service.automaticRecreditAmount !== null) {
            return OrderSms.Lexi().getCredits({
                serviceName: $stateParams.serviceName,
                quantity: service.automaticRecreditAmount
            }).$promise.then(function (credits) {
                return _.result(credits, "prices.withoutTax");
            }).then(function (price) {
                return _.assign(service, { price: price });
            });
        }
        service.price = null;
        return $q.when(service);

    }

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.update = function (service) {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/recredit/update/telecom-sms-options-recredit-update.html",
            controller: "TelecomSmsOptionsRecreditUpdateCtrl",
            controllerAs: "OptionsRecreditUpdateCtrl",
            resolve: {
                service: function () { return service; }
            }
        });

        modal.result.then(function () {
            self.loading.price = true;

            return fetchOfferPrice(self.service).finally(function () {
                self.loading.price = false;
            });
        }, function (error) {
            if (error && error.type === "API") {
                Toast.error($translate.instant("sms_options_recredit_update_ko", { error: error.message }));
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return SmsMediator.initDeferred.promise.then(function () {
            self.service = SmsMediator.getCurrentSmsService();
            return self.service;
        }).then(function (service) {
            return fetchOfferPrice(service);
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
