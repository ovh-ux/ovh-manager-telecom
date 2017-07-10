angular.module("managerApp").controller("TelecomTelephonyBillingAccountOrderAliasCtrl", function ($q, $state, $stateParams, TelephonyMediator, TelecomTelephonyBillingAccountOrderAliasService) {
    "use strict";

    this.state = $state.parent;

    var self = this;

    self.loading = {
        init: false
    };

    function loadOffers () {
        $q.when()
            .then(function () {
                return TelecomTelephonyBillingAccountOrderAliasService.getUser();
            })
            .then(function (user) {
                return TelecomTelephonyBillingAccountOrderAliasService.getOffers(
                    $stateParams.billingAccount,
                    user.country,
                    {
                        range: "common"
                    }
                );
            })
            .then(function (offerDetails) {
                self.offers = offerDetails;
                return offerDetails;
            })
            .finally(function () {
                self.loading.init = false;
            });
    }

    function init () {
        self.loading.init = true;

        loadOffers();
    }

    init();

}
);
