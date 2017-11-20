/**
 *  Will be used to replace telecom/telephony factories and services like it has been done in a bad way :-)
 *  Groups cache will be removed and everything will be refreshed by APIv7 calls.
 */
angular.module("managerApp").service("telecomVoip", class {

    constructor (OvhApiTelephony, voipBillingAccount, voipService) {
        this.ovhApiTelephony = OvhApiTelephony;
        this.voipBillingAccount = voipBillingAccount;
        this.voipService = voipService;
    }

    /**
     *  Fetch all (billing accounts and associated services) of connected user.
     *
     *  @param {Boolean} [withError=true]   Either return billingAccounts and services with error or not. Should be replaced with better filters when APIv7 will be able to filter by status code (SOON !!!).
     *
     *  @return {Promise} That returns all services grouped by billing accounts.
     */
    fetchAll (withError = true) {
        return this.voipBillingAccount.getAll(withError).then((billingAccounts) =>
            this.voipService.getAll(withError).then((services) => {
                billingAccounts.forEach((billingAccount) =>
                    billingAccount.addServices(_.filter(services, {
                        billingAccount: billingAccount.billingAccount
                    }))
                );

                return billingAccounts;
            })
        );
    }

    /**
     *  @description
     *  Get the list of services of given billing accounts.
     *
     *  @param  {Array.<VoipBillingAccount>} billingAccounts An array of VoipBillingAccount instances that you want to get services.
     *
     *  @return {Array.<VoipService>}   The concatenated array of VoipService instances.
     */
    static concatServices (billingAccounts) {
        return _.chain(billingAccounts).map("services").flatten().value();
    }

});
