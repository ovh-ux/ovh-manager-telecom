angular.module("managerApp").controller("TelecomSmsOptionsRecreditCtrl", class TelecomSmsOptionsRecreditCtrl {
    constructor ($q, $stateParams, $translate, $uibModal, OvhApiOrderSms, SmsMediator, Toast, ToastError) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.$uibModal = $uibModal;
        this.api = {
            orderSms: OvhApiOrderSms.v6()
        };
        this.SmsMediator = SmsMediator;
        this.Toast = Toast;
        this.ToastError = ToastError;
    }

    $onInit () {
        this.loading = {
            init: false,
            price: false
        };
        this.service = null;

        this.loading.init = true;
        return this.SmsMediator.initDeferred.promise.then(() => {
            this.service = this.SmsMediator.getCurrentSmsService();
            return this.service;
        }).then((service) => this.fetchOfferPrice(service)).catch((err) => {
            this.ToastError(err);
        }).finally(() => {
            this.loading.init = false;
        });
    }

    /**
     * Fetch offer price.
     * @param  {Ojbect} service SmsService
     * @return {Promise}
     */
    fetchOfferPrice (service) {
        if (service.automaticRecreditAmount !== null) {
            return this.api.orderSms.getCredits({
                serviceName: this.$stateParams.serviceName,
                quantity: service.automaticRecreditAmount
            }).$promise.then((credits) =>
                _.result(credits, "prices.withoutTax")
            ).then((price) => _.assign(service, { price }));
        }
        service.price = null;
        return this.$q.when(service);
    }

    /**
     * Opens a modal to manage sms recredit options.
     * @param  {Object} service SmsService
     */
    update (service) {
        const modal = this.$uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/options/recredit/update/telecom-sms-options-recredit-update.html",
            controller: "TelecomSmsOptionsRecreditUpdateCtrl",
            controllerAs: "OptionsRecreditUpdateCtrl",
            resolve: { service: () => service }
        });
        modal.result.then(() => {
            this.loading.price = true;
            return this.fetchOfferPrice(this.service).finally(() => {
                this.loading.price = false;
            });
        }).catch((error) => {
            if (error && error.type === "API") {
                this.Toast.error(this.$translate.instant("sms_options_recredit_update_ko", { error: error.message }));
            }
        });
    }
});
