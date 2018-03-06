/**
 * Container service for old OVH offers to handle previously available offers in OVH catalog
 * @return {Object}   Old offer container service
 */
angular.module("managerApp").service("VoipLineOldOffers", function () {
    "use strict";

    var self = this;

    self.oldOffers = {
        sipNFax: ["10v1"]
    };
});
