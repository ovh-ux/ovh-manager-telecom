/**
 *  @ngdoc object
 *  @name managerApp.object:VoipLine
 *
 *  @description
 *  <p>Inherits from {@link managerApp.object:VoipLineFeature VoipLineFeature}.</p>
 *  <p>Factory that describes a line feature with attributes
 *    returned by `/telephony/{billingAccount}/line/{serviceName}` API.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of VoipLine (see
 *                          {@link managerApp.object:VoipLineFeature `VoipLineFeature` constructor}
 *                          for availables inherited options properties and
 *  {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/line/%7BserviceName%7D#GET `telephony.Line` enum} for specific line options properties).
 */
angular.module('managerApp').factory('VoipLine', (VoipLineFeature) => {
  class VoipLine extends VoipLineFeature {
    constructor(options = {}) {
      // set parent options
      super(options);

      // set VoipLine options
      this.setOptions(options);
    }

    /**
     *  @ngdoc method
     *  @name managerApp.object:VoipLine#setOptions
     *  @propertyOf managerApp.object:VoipLine
     *
     *  @description
     *  Set the options from `telephony.Line` enum. This is called by default by the constructor.
     *
     *  @return {VoipLine} The `VoipLine` instance with options setted.
     */
    setOptions(featureOptions) {
      super.setOptions(featureOptions);

      this.infrastructure = featureOptions.infrastructure;
      this.isAttachedToOtherLinesPhone = featureOptions.isAttachedToOtherLinesPhone;
      this.simultaneousLines = featureOptions.simultaneousLines;
    }
  }

  return VoipLine;
});
