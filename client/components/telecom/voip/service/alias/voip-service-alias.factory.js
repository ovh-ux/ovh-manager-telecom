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
angular.module('managerApp').factory('VoipServiceAlias', (VoipService) => {
  class VoipServiceAlias extends VoipService {
    constructor(options = {}) {
      super(options);
    }
  }

  return VoipServiceAlias;
});
