angular.module("managerApp").controller("TelecomSmsSmsHlrCtrl", class TelecomSmsSmsHlrCtrl {
    constructor ($stateParams, $q, $translate, OvhApiSms, SmsMediator, validator, Toast, ToastError, SMS_URL) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.$translate = $translate;
        this.api = {
            sms: {
                hlr: OvhApiSms.Hlr().v6()
            }
        };
        this.SmsMediator = SmsMediator;
        this.validator = validator;
        this.Toast = Toast;
        this.ToastError = ToastError;
        this.constant = { SMS_URL };
    }

    $onInit () {
        this.hlr = {
            data: null,
            isSending: false
        };
        this.service = null;

        this.refreshHlr();
    }

    /**
     * Fetch mobile or landline phone operator.
     * @param  {Object} hlr
     * @return {Promise}
     */
    fetchPhoneOperator (hlr) {
        return this.api.sms.hlr.getOperator({
            serviceName: this.$stateParams.serviceName,
            id: hlr.id
        }).$promise;
    }

    /** @TODO removed when api returns the Terms Of Use (CGU) **/
    /**
     * Get HLR terms of use.
     * @return {String}
     */
    getHlrTermsOfUse () {
        return this.constant.SMS_URL.hlrTermsOfUse;
    }

    refreshHlr () {
        this.hlr.data = null;
        this.api.sms.hlr.resetCache();
        this.api.sms.hlr.resetQueryCache();
        return this.SmsMediator.initDeferred.promise.then(() =>
            this.api.sms.hlr.query({
                serviceName: this.$stateParams.serviceName
            }).$promise.then((hlrIds) => hlrIds.sort((a, b) => b - a).map((id) => ({ id }))
            ).then((hlrs) => {
                this.hlr.data = hlrs;
                this.service = this.SmsMediator.getCurrentSmsService();
            })
        ).catch((err) => {
            this.ToastError(err);
        });
    }

    /**
     * Get details.
     * @param  {Object} hlr item
     * @return {Promise}
     */
    getDetails (item) {
        if (item.transformed) {
            return this.$q((resolve) => resolve(item));
        }
        return this.api.sms.hlr.get({
            serviceName: this.$stateParams.serviceName,
            id: item.id
        }).$promise.then((hlr) => {
            hlr.transformed = true;
            return hlr;
        }).then((hlr) =>
            this.fetchPhoneOperator(hlr).then((operator) =>
                _.assign(hlr, { operatorName: operator.operator })
            ).catch(() => hlr)
        );
    }

    /**
     * Send a HLR query.
     * @return {Promise}
     */
    send () {
        this.hlr.isSending = true;
        return this.api.sms.hlr.send({
            serviceName: this.$stateParams.serviceName
        }, {
            receivers: [this.receiver]
        }).$promise.then(() => {
            this.service.creditsLeft -= 0.1;
            this.Toast.success(this.$translate.instant("sms_sms_hlr_query_send_success"));
            return this.refreshHlr();
        }).catch(() => {
            this.Toast.error(this.$translate.instant("sms_sms_hlr_query_send_failed"));
        }).finally(() => {
            this.hlr.isSending = false;
        });
    }

    /* eslint-disable class-methods-use-this */
    /**
     * Format receiver number.
     * @param  {String} number
     * @return {String}
     */
    formatReceiverNumber (number) {
        if (number) {
            if (_.startsWith(number, "00")) {
                return "+" + _.trimLeft(number, "00");
            } else if (number.charAt(0) === "0") {
                return "+33" + number.slice(1);
            }
        }
        return number;
    }
    /* eslint-enable class-methods-use-this */

    /**
     * Compute receiver.
     */
    computeReceiver () {
        this.receiver = this.formatReceiverNumber(this.receiver);
    }

    /**
     * Restrict input.
     */
    restrictInput () {
        if (this.receiver) {
            this.receiver = this.receiver.replace(/[^0-9\+]/g, "");
        }
    }
});
