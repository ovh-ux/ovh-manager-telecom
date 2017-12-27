/**
 *  @description
 *  Describe a service that manage fax and freefax feature types.
 *  API side, it's /telephony/{billingAccount}/fax/{serviceName} that manage these types.
 */
angular.module("managerApp").service("voipFax", class {

    constructor (OvhApiTelephony, VoipLineFeature) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipLineFeature = VoipLineFeature;
    }

    fetchFeature (service) {
        return this.OvhApiTelephony.Fax().Lexi().get({
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

    saveFeature (feature, featureOptions) {
        return this.OvhApiTelephony.Fax().Lexi().edit({
            billingAccount: feature.billingAccount,
            serviceName: feature.serviceName
        }, featureOptions).$promise.then(() =>
            feature.setOptions(featureOptions)      // set the new options saved
        );
    }

});
