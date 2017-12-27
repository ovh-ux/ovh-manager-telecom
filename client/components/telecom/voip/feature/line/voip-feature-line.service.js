/**
 *  @description
 *  Describe a service that manage features of services with serviceType line. This is not the line feature that is managed !!!
 *  This will manage what is shared between /line and /fax API routes.
 */
angular.module("managerApp").service("voipLineFeature", class {

    constructor (voipLine, voipFax, OvhApiTelephony) {
        this.voipLine = voipLine;
        this.voipFax = voipFax;
        this.OvhApiTelephony = OvhApiTelephony;
    }

    fetchFeature (service) {
        // first check featureType of the service
        if (this.isFax(service.featureType)) {
            // if fax or freefax - let the fax service fetch the feature
            return this.voipFax.fetchFeature(service);
        }

        // otherwise let the line service fetch the feature
        return this.voipLine.fetchFeature(service);
    }

    saveFeature (feature, options) {
        // first check featureType of the service
        if (this.isFax(feature.featureType)) {
            // if fax or freefax - let the fax service save the notifications
            return this.voipFax.saveFeature(feature, options);
        }

        // otherwise let the line service save the notifications
        return this.voipLine.saveFeature(feature, options);
    }

    /**
     *  @description
     *  Determine if the given feature type is fax type (and so managed by /fax API routes).
     *
     *  @param  {String}  featureType The feature type to check.
     *
     *  @return {Boolean}
     */
    isFax (featureType) {
        return ["fax", "freefax"].indexOf(featureType) > -1;
    }

});
