/**
 *  @ngdoc object
 *  @name managerApp.object:VoipServiceLine
 *
 *  @description
 *  <p>Inherits from {@link managerApp.object:VoipService VoipService}.</p>
 *  <p>This factory doesn't describe any API return. The API that describes
 *    the most this factory is `/telephony/{billingAccount}/service/{serviceName}`.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of VoipServiceLine
 *                          (see {@link managerApp.object:VoipService `VoipService` constructor}
 *                          for availables options properties).
 */
angular.module('managerApp').factory('VoipServiceLine', (VoipService) => {
  class VoipServiceLine extends VoipService {
    constructor(options = {}) {
      super(options);
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipServiceLine#getRealFeatureType
     *  @propertyOf managerApp.object:VoipServiceLine
     *
     *  @description
     *  Get the real feature type of a service. Useful to get trunk lines.
     *
     *  @return {String} The real feature type of the service.
     */
    getRealFeatureType() {
      return this.isSipTrunk() ? 'trunk' : this.featureType;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipServiceLine#isSipTrunk
     *  @propertyOf managerApp.object:VoipServiceLine
     *
     *  @description
     *  Helper that try to check if the service offer is trunk or not.
     *
     *  @return {Boolean}   `true` if the line service is a sip trunk.
     */
    isSipTrunk() {
      const publicOfferName = _.get(this.getPublicOffer, 'name');
      return publicOfferName === 'trunk' || _.get(publicOfferName.split('.'), '[0]') === 'trunk';
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipServiceLine#isSipTrunkRates
     *  @propertyOf managerApp.object:VoipServiceLine
     *
     *  @description
     *  Helper that try to check if the service offer is trunk rates or not.
     *
     *  @return {Boolean}   `true` if the line service is a sip trunk rates.
     */
    isSipTrunkRates() {
      return _.some(this.offers, offer => offer === 'voip.main.offer.fr.trunk.rates');
    }
  }

  return VoipServiceLine;
});
