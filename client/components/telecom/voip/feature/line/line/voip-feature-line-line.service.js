/**
 *  @description
 *  Describe a service that manage sip, mgcp, plugAndFax, ... feature types (all featureTypes that are not fax and freefax for line services).
 *  API side, it's /telephony/{billingAccount}/line/{serviceName} that manage these types.
 */
angular.module("managerApp").service("voipLine", class {

    constructor (OvhApiTelephony, VoipLine) {
        this.OvhApiTelephony = OvhApiTelephony;
        this.VoipLine = VoipLine;
    }

    fetchFeature (service) {
        return this.OvhApiTelephony.Line().Lexi().get({
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

});
