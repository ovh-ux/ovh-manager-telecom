angular.module("managerApp").controller("PackHubicCtrl", function (OvhApiPackXdslHubic, $stateParams, URLS, $q, $translate, Toast) {
    "use strict";

    var self = this;

    this.loaders = {
        services: true
    };

    /**
     * Load all hubic services
     * @return {Promise}
     */
    this.loadHubics = function () {
        this.loaders.services = true;
        this.services = [];

        return OvhApiPackXdslHubic.Aapi().query({
            packId: $stateParams.packName
        }).$promise.then(function (services) {
            self.services = _.map(services, function (service) {
                var voucherUrl = [URLS.hubicVoucher, "token=" + service.voucher].join("?");
                return _.extend(
                    service,
                    {
                        url: service.voucher ? voucherUrl : URLS.hubicLogin
                    }
                );
            });
            return self.services;
        }).catch(function (err) {
            Toast.error($translate.instant("pack_xdsl_hubic_loading_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loaders.services = false;
        });

    };

    /**
     * Initialize controller
     */
    this.$onInit = function init () {

        // Get service link to this access from current Pack Xdsl
        this.loadHubics();
    };

});
