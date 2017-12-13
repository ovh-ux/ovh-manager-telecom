angular.module("managerApp").service("voipBillingAccount", class {

    constructor (OvhApiTelephony, VoipBillingAccount) {
        this.ovhApiTelephony = OvhApiTelephony;
        this.VoipBillingAccount = VoipBillingAccount;
    }

    /**
     *  @description
     *  Get all billingAccounts of connected user.
     *
     *  @param {Boolean} [withError=true]   Either return billingAccounts and services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That return an Array of VoipBillingAccount instances.
     */
    getAll (withError = true) {
        return this.ovhApiTelephony.Erika().query().expand().execute().$promise.then((result) =>
            _.chain(result).filter((res) =>
                _.has(res, "value") || (withError && _.has(res, "error"))
            ).map((res) => {
                if (res.value) {
                    return new this.VoipBillingAccount(res.value);
                }
                return new this.VoipBillingAccount({
                    billingAccount: res.key,
                    error: res.error
                });
            }).value()
        );
    }

});
