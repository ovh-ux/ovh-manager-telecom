/**
 *  @ngdoc service
 *  @name managerApp.service:voipBillingAccount
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:VoipBillingAccount
 *
 *  @description
 *  Service that manage API calls to `/telephony/{billingAccount}`.
 */
angular.module("managerApp").service("voipBillingAccount", class {

    constructor (OvhApiTelephony, VoipBillingAccount) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipBillingAccount = VoipBillingAccount;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipBillingAccount#fetchAll
     *  @methodOf managerApp.service:voipBillingAccount
     *
     *  @description
     *  Get all billingAccounts of connected user using API v7.
     *
     *  @param {Boolean} [withError=true]   Either return billingAccounts and services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That return an Array of VoipBillingAccount instances.
     */
    fetchAll (withError = true) {
        return this.OvhApiTelephony.v7().query().expand().execute().$promise.then((result) =>
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
