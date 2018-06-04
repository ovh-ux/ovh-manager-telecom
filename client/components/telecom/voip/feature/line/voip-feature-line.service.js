/**
 *  @ngdoc service
 *  @name managerApp.service:voipLineFeature
 *
 *  @requires managerApp.service:voipLine
 *  @requires managerApp.service:voipFax
 *  @requires OvhApiTelephony from ovh-api-services
 *
 *  @description
 *  <p>Service that manage features of services with serviceType line.
 *    This is not the line feature that is managed (the line service type either) !!!</p>
 *  <p>This service will manage API calls to `/telephony/{billingAccount}/line/{serviceName}`
 *    and `/telephony/{billingAccount}/fax/{serviceName}`</p>
 */
angular.module('managerApp').service('voipLineFeature', class {
  constructor(voipLine, voipFax, OvhApiTelephony) {
    this.voipLine = voipLine;
    this.voipFax = voipFax;
    this.OvhApiTelephony = OvhApiTelephony;
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipLineFeature#fetchFeature
   *  @methodOf managerApp.service:voipLineFeature
   *
   *  @description
   *  Fetch feature from a service. Will let the good sub-service (`voipLine` or `voipFax`)
   *  managing the good API call.
   *
   *  @param {VoipService} service    A `VoipService` instance.
   *
   *  @return {Promise}   That return a `VoipFeature` instance.
   */
  fetchFeature(service) {
    // first check featureType of the service
    if (this.constructor.isFax(service.featureType)) {
      // if fax or freefax - let the fax service fetch the feature
      return this.voipFax.fetchFeature(service);
    }

    // otherwise let the line service fetch the feature
    return this.voipLine.fetchFeature(service);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipLineFeature#saveFeature
   *  @methodOf managerApp.service:voipLineFeature
   *
   *  @description
   *  Save a feature by letting the good sub-service (`voipLine` or `voipFax`)
   *  managing the good API call.
   *
   *  @param {VoipFeature}    feature    The `VoipFeature` instance to save.
   *  @param {Object}         options    The new options of the `VoipFeature` instance.
   *
   *  @return {Promise}   That return the `VoipFeature` instance with saved value.
   */
  saveFeature(feature, options) {
    // first check featureType of the service
    if (this.constructor.isFax(feature.featureType)) {
      // if fax or freefax - let the fax service save the feature
      return this.voipFax.saveFeature(feature, options);
    }

    // otherwise let the line service save the feature
    return this.voipLine.saveFeature(feature, options);
  }

  /**
   *  @ngdoc method
   *  @name managerApp.service:voipLineFeature#isFax
   *  @methodOf managerApp.service:voipLineFeature
   *
   *  @description
   *  Determine if the given feature type is fax type (and so managed by /fax API routes).
   *
   *  @param  {String}  featureType The feature type to check.
   *
   *  @return {Boolean}   `true` if featureType is considered as fax.
   */
  static isFax(featureType) {
    return ['fax', 'freefax'].indexOf(featureType) > -1;
  }
});
