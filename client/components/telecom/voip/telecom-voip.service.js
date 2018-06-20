/**
 *  @ngdoc overview
 *  @name managerApp
 *  @description
 *  # OVH Control Panel Telecom UI
 *
 *  <p>Welcome in OVH Manager Telecom (the OVH Control Panel Telecom UI) documentation!</p>
 *  <p>This is the beginning of writing a documentation to help us
 *    to improve the OVH Telecom Control Panel.</p>
 *  <p>For the moment, only telephony (VoIP) section will be documented.
 *    It will show you how to use angular services to make the good calls to OVH API.</p>
 */

/**
 *  @ngdoc service
 *  @name managerApp.service:telecomVoip
 *
 *  @requires managerApp.service:voipBillingAccount
 *  @requires managerApp.service:voipService
 *
 *  @description
 *  <p>This service is the beginning of everything :-)
 *    This service will allow you to fetch all billingAccounts
 *    and their services in one API call. It's used for example to display sidebar menu.</p>
 *  <p>This will be used to replace telecom/telephony factories
 *    and services like it has been done in a bad way :-)</p>
 *  <p>Groups cache will be removed and everything will be refreshed by APIv7 calls.</p>
 */
angular.module('managerApp').service('telecomVoip', class {
  constructor(voipBillingAccount, voipService) {
    this.voipBillingAccount = voipBillingAccount;
    this.voipService = voipService;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:telecomVoip#fetchAll
   *  @methodOf managerApp.service:telecomVoip
   *
   *  @description
   *  Fetch all (billing accounts and associated services) of connected user.
   *
   *  @param {Boolean} [withError=true]   Either return billingAccounts and services
   *                                      with error or not. Should be replaced with better filters
   *                                      when APIv7 will be able to filter by status code (SOON!!).
   *
   *  @return {Promise} That returns all services grouped by billing accounts.
   */
  fetchAll(withError = true) {
    return this.voipBillingAccount.fetchAll(withError).then(billingAccounts =>
      this.voipService.fetchAll(withError).then((services) => {
        billingAccounts.forEach(billingAccount =>
          billingAccount.addServices(_.filter(services, {
            billingAccount: billingAccount.billingAccount,
          })));

        return billingAccounts;
      }));
  }
});
