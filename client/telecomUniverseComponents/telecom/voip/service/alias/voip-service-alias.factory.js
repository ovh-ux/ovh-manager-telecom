/**
 *  @ngdoc object
 *  @name managerApp.object:TucVoipServiceAlias
 *
 *  @description
 *  <p>Inherits from {@link managerApp.object:TucVoipService TucVoipService}.</p>
 *  <p>Factory that describes an alias service with attributes
 *    returned by `/telephony/{billingAccount}/number/{serviceName}` API.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of TucVoipServiceAlias
 *                  (see {@link managerApp.object:TucVoipService `TucVoipService` constructor}
 *                          for availables options properties).
 */
export default /* @ngInject */ (TucVoipService) => {
  class TucVoipServiceAlias extends TucVoipService {
    constructor(options = {}) {
      super(options);
    }
  }

  return TucVoipServiceAlias;
};
