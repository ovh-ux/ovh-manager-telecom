angular.module("managerApp").controller("TelecomSmsOptionsResponseEditCtrl", class TelecomSmsOptionsResponseEditCtrl {
    constructor ($q, $stateParams, $timeout, $uibModalInstance, OvhApiSms, SmsMediator, service, senders, index, option, ToastError) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$timeout = $timeout;
        this.$uibModalInstance = $uibModalInstance;
        this.api = {
            sms: OvhApiSms.v6()
        };
        this.SmsMediator = SmsMediator;
        this.service = service;
        this.senders = senders;
        this.index = index;
        this.option = option;
        this.ToastError = ToastError;
    }

    $onInit () {
        this.loading = {
            init: false,
            editTrackingOption: false
        };
        this.edited = false;
        this.model = {
            service: angular.copy(this.service),
            senders: angular.copy(this.senders),
            index: this.index,
            option: angular.copy(this.option)
        };
        this.availableTrackingMedia = [];
        this.trackingOptions = {};
        this.trackingSender = {};
        this.targetNumberPattern = /^\+?[\d+]{8,14}$/;

        this.loading.init = true;
        return this.SmsMediator.initDeferred.promise.then(() =>
            this.SmsMediator.getApiScheme().then((schema) => {
                this.availableTrackingMedia = _.pull(schema.models["sms.ResponseTrackingMediaEnum"].enum, "voice");
                this.trackingOptions.media = this.model.option.media;
                this.trackingSender.sender = this.model.option.sender;
            })
        ).catch((err) => {
            this.ToastError(err);
        }).finally(() => {
            this.loading.init = false;
        });
    }

    /**
     * Edit sms tesponse tracking options.
     * @return {Promise}
     */
    edit () {
        this.model.service.smsResponse.trackingOptions[this.model.index] = {
            media: this.trackingOptions.media,
            sender: this.trackingOptions.media === "sms" ? _.get(this.trackingSender.sender, "sender") : this.model.option.sender,
            target: this.model.option.target
        };
        this.loading.editTrackingOption = true;
        return this.$q.all([
            this.api.sms.edit({
                serviceName: this.$stateParams.serviceName
            }, {
                smsResponse: {
                    trackingOptions: this.model.service.smsResponse.trackingOptions,
                    responseType: this.model.service.smsResponse.responseType
                }
            }).$promise,
            this.$timeout(angular.noop, 1000)
        ]).then(() => {
            this.loading.editTrackingOption = false;
            this.edited = true;
            return this.$timeout(() => this.close(), 1000);
        }).catch((error) => this.cancel({
            type: "API",
            msg: error
        }));
    }

    /**
     * Reset tracking options.
     */
    resetTrackingOptions () {
        this.model.option.sender = this.model.option.target = "";
    }

    cancel (message) {
        return this.$uibModalInstance.dismiss(message);
    }

    close () {
        return this.$uibModalInstance.close(true);
    }
});
