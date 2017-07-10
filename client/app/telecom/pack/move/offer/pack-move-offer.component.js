angular.module("managerApp").component("packMoveOffer", {
    bindings: {
        offerModel: "=?",
        offer: "=?",
        change: "&"
    },
    templateUrl: "app/telecom/pack/move/offer/pack-move-offer.html",
    controllerAs: "PackMoveOffer",
    controller: function () {
        "use strict";
        var self = this;

        this.KbPerMb = 1024;

        this.changeOffer = function () {
            this.change({ OFFER: self.offer });
        };

        Object.defineProperties(self.offer, {
            _patternReseller: {
                enumerable: false,
                configurable: false,
                writable: false,
                value: /reseller/i
            },
            isResellerOffer: {
                enumerable: true,
                configurable: false,
                get: function () {
                    return this._patternReseller.test(this.offerCode);
                },
                set: function () {
                    throw new Error("isResellerOffer is a read only property");
                }
            }
        });
    }
});
