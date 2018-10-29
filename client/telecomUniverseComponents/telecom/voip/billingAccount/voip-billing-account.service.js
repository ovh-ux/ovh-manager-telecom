import _ from 'lodash';

/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipBillingAccount
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:TucVoipBillingAccount
 *
 *  @description
 *  Service that manage API calls to `/telephony/{billingAccount}`.
 */
export default class {
  constructor(OvhApiTelephony, TucVoipBillingAccount) {
    'ngInject';

    this.OvhApiTelephony = OvhApiTelephony;
    this.TucVoipBillingAccount = TucVoipBillingAccount;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipBillingAccount#fetchAll
   *  @methodOf managerApp.service:tucVoipBillingAccount
   *
   *  @description
   *  Get all billingAccounts of connected user using API v7.
   *
   *  @param {Boolean} [withError=true]   Either return billingAccounts and services
   *                                      with error or not. Should be replaced with better filters
   *                                      when APIv7 will be able to filter by status code (SOON!!).
   *
   *  @return {Promise} That return an Array of TucVoipBillingAccount instances.
   */
  fetchAll(withError = true) {
    return this.OvhApiTelephony.v7().query().expand().execute().$promise.then(result => _.chain(result).filter(res => _.has(res, 'value') || (withError && _.has(res, 'error'))).map((res) => {
      if (res.value) {
        return new this.TucVoipBillingAccount(res.value);
      }
      return new this.TucVoipBillingAccount({
        billingAccount: res.key,
        error: res.error,
      });
    }).value());
  }
}
