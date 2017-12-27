/**
 *  @description
 *  Describe a voip feature (e.g. sip, mgcp, contactCenterSolution, ...).
 */
angular.module("managerApp").factory("VoipFeature", function () {
    "use strict";

    const mandatoryOptions = ["billingAccount", "serviceName", "featureType"];

    class VoipFeature {
        constructor (options = {}) {
            // check for mandatory options
            mandatoryOptions.forEach((option) => {
                if (!options[option]) {
                    throw new Error(`${option} option must be specified when creating a new VoipFeature`);
                }
            });

            // populate object attributes
            // mandatory attribute
            this.billingAccount = options.billingAccount;
            this.serviceName = options.serviceName;
            this.featureType = options.featureType;
        }
    }

    return VoipFeature;

});
