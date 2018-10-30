/**
 *  @ngdoc service
 *  @name managerApp.service:tucVoipServiceLine
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *
 *  @description
 *  Service that manage specific API calls for sip/trunk lines.
 */
export default class {
  constructor(OvhApiTelephony) {
    'ngInject';

    this.OvhApiTelephony = OvhApiTelephony;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceLine#getLineOptions
   *  @methodOf managerApp.service:tucVoipServiceLine
   *
   *  @description
   *  <p>Get options list of a voip line.</p>
   *
   *  @param  {VoipServiceLine} line           (destructured) current voip line
   *
   *  @return {Promise}
   */
  getLineOptions({ billingAccount, serviceName }) {
    return this.OvhApiTelephony.Line().Options().v6().get({
      billingAccount,
      serviceName,
    }).$promise;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:tucVoipServiceLine#changeLineOptions
   *  @methodOf managerApp.service:tucVoipServiceLine
   *
   *  @description
   *  <p>Change options of a voip line.</p>
   *
   *  @param  {VoipServiceLine} line           (destructured) current voip line
   *  @param  {Object}          options        Options to update
   *
   *  @return {Promise}
   */
  changeLineOptions({ billingAccount, serviceName }, options) {
    return this.OvhApiTelephony.Line().Options().v6().update({
      billingAccount,
      serviceName,
    }, options).$promise;
  }
}
