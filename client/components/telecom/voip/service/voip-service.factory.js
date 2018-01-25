/**
 *  @ngdoc object
 *  @name managerApp.object:VoipService
 *
 *  @description
 *  <p>Factory that describes a service with attributes returned by `/telephony/{billingAccount}/service/{serviceName}` API.</p>
 *  <p>See {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D#GET `telephony.TelephonyService` enum} for available properties.</p>
 *
 *  @constructor
 *  @param {Object} options Options required for creating a new instance of VoipService (see {@link https://eu.api.ovh.com/console/#/telephony/%7BbillingAccount%7D/service/%7BserviceName%7D#GET `telephony.TelephonyService` enum}
 *  for availables options properties).
 *
 *  Note that `billingAccount` and `serviceName` options are mandatory.
 */
angular.module("managerApp").factory("VoipService", function () {
    "use strict";

    const mandatoryOptions = ["billingAccount", "serviceName"];

    class VoipService {
        constructor (options = {}) {
            // check for mandatory options
            mandatoryOptions.forEach((option) => {
                if (!options[option]) {
                    throw new Error(`${option} option must be specified when creating a new VoipService`);
                }
            });

            // populate object attributes
            // mandatory attribute
            this.billingAccount = options.billingAccount;
            this.serviceName = options.serviceName;

            // populate error (if some)
            this.error = options.error;

            // populate other attributes
            this.country = options.country;
            this.featureType = options.featureType;
            this.hasFaxCapabilities = options.hasFaxCapabilities;
            this.rio = options.rio;
            this.currentOutplan = options.currentOutplan;
            this.description = options.description;
            this.properties = options.properties;
            this.countryCode = options.countryCode;
            this.serviceType = options.serviceType;
            this.getPublicOffer = options.getPublicOffer;
            this.offers = options.offers;
            this.simultaneousLines = options.simultaneousLines;
        }

        /* ===================================
        =            Some Helpers            =
        ==================================== */

        /**
         *  @ngdoc method
         *  @name managerApp.object:VoipService#getDisplayedName
         *  @propertyOf managerApp.object:VoipService
         *
         *  @description
         *  Get the displayed name of the service.
         *
         *  @return {String} The displayedName of the service (the description if provided, the serviceName value otherwise).
         */
        getDisplayedName () {
            return this.description || this.serviceName;
        }

        /**
         *  @ngdoc method
         *  @name managerApp.object:VoipService#isDescriptionSameAsServiceName
         *  @propertyOf managerApp.object:VoipService
         *
         *  @description
         *  Helper that check if the description is the same as serviceName.
         *
         *  @return {Boolean}   `true` if description is the same that serviceName.
         */
        isDescriptionSameAsServiceName () {
            return this.description === this.serviceName;
        }

        /**
         *  @description
         *  Get the real feature type of a service. Useful to get trunk lines.
         *
         *  @return {String} The real feature type of the service.
         */
        getRealFeatureType () {
            return this.isSipTrunk() ? "trunk" : this.featureType;
        }

        /**
         *  @description
         *  Helper that try to check if the service offer is trunk or not.
         *
         *  @return {Boolean}
         */
        isSipTrunk () {
            var publicOfferName = _.get(this.getPublicOffer, "name");
            return publicOfferName === "trunk" || _.get(publicOfferName.split("."), "[0]") === "trunk";
        }

        /* -----  End of Some Helpers  ------ */

    }

    return VoipService;

});
