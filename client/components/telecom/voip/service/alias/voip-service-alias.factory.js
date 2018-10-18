/**
 *  @ngdoc object
 *  @name managerApp.object:VoipServiceAlias
 *
 *  @description
 *  <p>Inherits from {@link managerApp.object:VoipService VoipService}.</p>
 *  <p>Factory that describes an alias service with attributes
 *    returned by `/telephony/{billingAccount}/number/{serviceName}` API.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of VoipServiceAlias
 *                          (see {@link managerApp.object:VoipService `VoipService` constructor}
 *                          for availables options properties).
 */
angular.module('managerApp').factory('VoipServiceAlias', (VoipService, TELEPHONY_ALIAS) => {
  class VoipServiceAlias extends VoipService {
    constructor(options = {}) {
      super(options);

      this.TELEPHONY_ALIAS = TELEPHONY_ALIAS;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipServiceAlias#isAPortabilityAlias
     *  @propertyOf managerApp.object:VoipServiceAlias
     *
     *  @description
     *  Check if the alias is a portability one
     *
     *  @return {Boolean}
     */
    isAPortabilityAlias() {
      const publicOfferName = _.get(this, 'getPublicOffer.name', '');
      const regExp = new RegExp(/portability/);
      return regExp.test(publicOfferName);
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipServiceAlias#isContactCenterSolution
     *  @propertyOf managerApp.object:VoipServiceAlias
     *
     *  @description
     *  Check if the alias feature type is equivalent to Contact Center Solution feature
     *
     *  @return {Boolean}
     */
    isContactCenterSolution() {
      return this.TELEPHONY_ALIAS.featureTypes.contactCenterSolution.includes(this.featureType);
    }
  }

  return VoipServiceAlias;
});
