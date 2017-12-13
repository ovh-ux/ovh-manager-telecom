angular.module("managerApp").service("voipService", class {

    constructor (OvhApiTelephony, VoipService) {
        this.ovhApiTelephony = OvhApiTelephony;
        this.VoipService = VoipService;
    }

    /**
     *  @description
     *  Get all the service of connected user.
     *
     *  @param {Boolean} [withError=true]   Either return billingAccounts and services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That return an Array of VoipService instances.
     */
    getAll (withError = true) {
        return this.ovhApiTelephony.Service().Erika().query().aggregate("billingAccount").expand().execute().$promise.then((result) =>
            _.chain(result).filter((res) =>

                // bug on APIv7 ? Sometimes res.error is null but res.value.message contains the error message...
                // waiting for bugfix and test if message attribute is the only attribute of res.value object.
                _.has(res, "value") || (withError && (_.keys(res.value).length && _.has(res.value, "message")))
            ).map((res) => {
                let billingAccount = _.get(res.path.split("/"), "[2]");

                // same remark as above :-)
                if (res.error || (_.keys(res.value).length === 1 && _.has(res.value, "message"))) {
                    return new this.VoipService({
                        billingAccount: billingAccount,
                        serviceName: res.key,
                        error: res.error || res.value.message
                    });
                }

                _.set(res.value, "billingAccount", billingAccount);
                return new this.VoipService(res.value);
            }).value()
        );
    }

});
