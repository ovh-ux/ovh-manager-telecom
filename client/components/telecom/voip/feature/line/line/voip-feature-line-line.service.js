/**
 *  @ngdoc service
 *  @name managerApp.service:voipLine
 *
 *  @requires OvhApiTelephony from ovh-api-services
 *  @requires managerApp.object:VoipLine
 *
 *  @description
 *  <p>Describe a service that manage sip, mgcp, plugAndFax, ... feature types (all featureTypes that are not fax and freefax for line services).</p>
 *  <p>This service will manage API calls to `/telephony/{billingAccount}/line/{serviceName}` (see {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/line#GET telephony line APIs})</p>
 */
angular.module("managerApp").service("voipLine", class {

    constructor (OvhApiTelephony, VoipLine) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipLine = VoipLine;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipLine#fetchFeature
     *  @methodOf managerApp.service:voipLine
     *
     *  @description
     *  <p>Fetch a line feature from a service.</p>
     *  <p>Manage call to `GET /telephony/{billingAccount}/line/{serviceName}`.</p>
     *
     *  @param {VoipService} service    A `VoipService` instance.
     *
     *  @return {Promise}   That return a `VoipLine` instance.
     */
    fetchFeature (service) {
        return this.OvhApiTelephony.Line().v6().get({
            billingAccount: service.billingAccount,
            serviceName: service.serviceName
        }).$promise.then((featureOptions) => {
            // create an instance of the feature with it's options
            let feature = new this.VoipLine(angular.extend(featureOptions, {
                billingAccount: service.billingAccount,
                featureType: service.featureType
            }));

            // set service feature with VoipLine instance previously created
            service.feature = feature;

            return service.feature;
        });
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipLine#fetchLineInfo
     *  @methodOf managerApp.service:voipLine
     *
     *  @description
     *  <p>Fetch a line info from a service.</p>
     *  <p>Manage call to `GET /telephony/{billingAccount}/line`.</p>
     *
     *  @param {VoipService} service    A `VoipService` instance.
     *
     *  @return {Promise}   That return a `VoipLine` instance.
     */
    fetchLineInfo (service) {
        return this.OvhApiTelephony.Line().v6().get({
            billingAccount: service.billingAccount,
            serviceName: service.serviceName
        }).$promise;
    }

    /**
     *  @ngdoc method
     *  @name managerApp.service:voipLine#saveFeature
     *  @methodOf managerApp.service:voipLine
     *
     *  @description
     *  <p>Save a line feature.</p>
     *  <p>Manage call to `PUT /telephony/{billingAccount}/line/{serviceName}`.</p>
     *
     *  @param {VoipLine}   feature    The `VoipLine` instance to save.
     *  @param {Object}     options    The new options of the `VoipLine` instance.
     *
     *  @return {Promise}   That return the `VoipLine` instance with saved value.
     */
    saveFeature (feature, featureOptions) {
        return this.OvhApiTelephony.Line().v6().edit({
            billingAccount: feature.billingAccount,
            serviceName: feature.serviceName
        }, featureOptions).$promise.then(() =>
            feature.setOptions(featureOptions)      // set the new options saved
        );
    }

});
