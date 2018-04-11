/**
 *  @ngdoc service
 *  @name managerApp.service:voipFax
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:VoipLineFeature
 *
 *  @description
 *  <p>Describe a service that manage fax and freefax feature types.</p>
 *  <p>This service will manage API calls to `/telephony/{billingAccount}/fax/{serviceName}` (see {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/fax#GET telephony fax APIs})</p>
 */
angular.module("managerApp").service("voipFax", class {

    constructor (OvhApiTelephony, VoipLineFeature) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipLineFeature = VoipLineFeature;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipFax#fetchFeature
     *  @methodOf managerApp.service:voipFax
     *
     *  @description
     *  <p>Fetch a fax feature from a service.</p>
     *  <p>Manage call to `GET /telephony/{billingAccount}/fax/{serviceName}`.</p>
     *
     *  @param {VoipService} service    A `VoipService` instance.
     *
     *  @return {Promise}   That return a `VoipLineFeature` instance.
     */
    fetchFeature (service) {
        return this.OvhApiTelephony.Fax().v6().get({
            billingAccount: service.billingAccount,
            serviceName: service.serviceName
        }).$promise.then((featureOptions) => {
            // create an instance of the feature with it's options
            let feature = new this.VoipLineFeature(angular.extend(featureOptions, {
                billingAccount: service.billingAccount,
                featureType: service.featureType
            }));

            // set service feature with VoipLineFeature instance previously created
            service.feature = feature;

            return service.feature;
        });
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipFax#saveFeature
     *  @methodOf managerApp.service:voipFax
     *
     *  @description
     *  <p>Save a fax feature.</p>
     *  <p>Manage call to `PUT /telephony/{billingAccount}/fax/{serviceName}`.</p>
     *
     *  @param {VoipLineFeature}    feature    The `VoipLineFeature` instance to save.
     *  @param {Object}             options    The new options of the `VoipLineFeature` instance.
     *
     *  @return {Promise}   That return the `VoipLineFeature` instance with saved value.
     */
    saveFeature (feature, featureOptions) {
        return this.OvhApiTelephony.Fax().v6().edit({
            billingAccount: feature.billingAccount,
            serviceName: feature.serviceName
        }, featureOptions).$promise.then(() =>
            feature.setOptions(featureOptions)      // set the new options saved
        );
    }

});
