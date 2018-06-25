/**
 *  @ngdoc object
 *  @name managerApp.object:VoipLineFeature
 *
 *  @description
 *  <p>Inherits from {@link managerApp.object:VoipFeature VoipFeature}.</p>
 *  <p>Factory that describes a line feature (line or fax)
 *    with shared attributes returned by the different APIs.</p>
 *
 *  @constructor
 *  @param {Object} options                 Shared options required
 *                                          for creating a new instance of VoipLineFeature.
 *  @param {Object} options.notifications   An object representing the notifications options
 *                                          of the line feature.
 */
angular.module('managerApp').factory('VoipLineFeature', (VoipFeature) => {
  class VoipLineFeature extends VoipFeature {
    constructor(options = {}) {
      // set parent options
      super(options);

      // set VoipLineFeature options (from API)
      this.setOptions(options);
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipLineFeature#setOptions
     *  @propertyOf managerApp.object:VoipLineFeature
     *
     *  @description
     *  <p>Set the shared options between `telephony.Line` and `telephony.Fax` enums.</p>
     *
     *  @return {VoipLineFeature} The `VoipLineFeature` instance with options setted.
     */
    setOptions(featureOptions) {
      this.notifications = featureOptions.notifications;

      // if notifications logs is not setted. Set it to defaults
      if (_.isNull(_.get(this.notifications, 'logs'))) {
        _.set(this.notifications, 'logs', {
          email: null,
          frequency: 'Never',
          sendIfNull: false,
        });
      }

      return this;
    }
  }

  return VoipLineFeature;
});
