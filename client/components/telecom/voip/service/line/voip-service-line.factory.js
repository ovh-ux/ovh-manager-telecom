angular.module("managerApp").factory("VoipServiceLine", function (VoipService) {
    "use strict";

    class VoipServiceLine extends VoipService {
        constructor (options = {}) {
            super(options);
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
    }

    return VoipServiceLine;

});
