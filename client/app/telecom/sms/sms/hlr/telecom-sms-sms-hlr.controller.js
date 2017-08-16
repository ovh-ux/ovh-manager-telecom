angular.module("managerApp").controller("TelecomSmsSmsHlrCtrl", class TelecomSmsSmsHlrCtrl {
    constructor ($stateParams, $q, $translate, Sms, SmsMediator, validator, Toast, ToastError, SMS_URL) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.$translate = $translate;
        this.api = {
            sms: {
                hlr: Sms.Hlr().Lexi()
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
            raw: null,
            paginated: null,
            isLoading: false,
            isSending: false,
            orderBy: "datetime",
            orderDesc: true
        };
        this.service = null;

        this.hlr.isLoading = true;
        return this.SmsMediator.initDeferred.promise.then(() =>
            this.api.sms.hlr.query({
                serviceName: this.$stateParams.serviceName
            }).$promise.then((hlr) => {
                this.hlr.raw = hlr;
                this.service = this.SmsMediator.getCurrentSmsService();
            })
        ).catch((err) => {
            this.ToastError(err);
        }).finally(() => {
            this.hlr.isLoading = false;
        });
    }

    /**
     * Fetch operator.
     * @param  {Object} hlr
     * @return {Promise}
     */
    fetchOperator (hlr) {
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

    refresh () {
        this.hlr.raw = null;
        this.api.sms.hlr.resetCache();
        this.api.sms.hlr.resetQueryCache();
        return this.api.sms.hlr.query({
            serviceName: this.$stateParams.serviceName
        }).$promise.then((hlr) => {
            this.hlr.raw = hlr;
        });
    }

    /**
     * Get details.
     * @param  {String} id
     * @return {Promise}
     */
    getDetails (id) {
        this.hlr.isLoading = true;
        return this.api.sms.hlr.get({
            serviceName: this.$stateParams.serviceName,
            id
        }).$promise.then((hlr) =>
            this.fetchOperator(hlr).then((operator) =>
                _.assign(hlr, { operatorName: operator.operator })
            ).catch(() => hlr)
        );
    }

    onTransformItemDone () {
        this.hlr.isLoading = false;
    }

    /**
     * Order HLR queries' list.
     * @param  {String} by
     */
    orderBy (by) {
        if (this.hlr.orderBy === by) {
            this.hlr.orderDesc = !this.hlr.orderDesc;
        } else {
            this.hlr.orderBy = by;
        }
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
            return this.refresh();
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
