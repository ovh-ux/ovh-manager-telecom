angular.module("managerApp").controller("PackHubicCtrl", function (OvhApiPackXdslHubic, $scope, $stateParams, URLS, $q, $translate, Toast, Poller) {
    "use strict";

    var self = this;
    var domainDetailsRoute = "/pack/xdsl/{packName}/hubic/services/{domain}/details";
    var hubicLoginUrl = "https://hubic.com/home/";

    this.loaders = {
        services: true
    };

    /**
     * Get detail of a domain voucher already used
     * @param  {string} domain
     */
    function getVoucherDetails (domain) {
        var url = domainDetailsRoute.replace("{packName}", $stateParams.packName).replace("{domain}", domain);
        return Poller.poll(
            url,
            null,
            {
                successRule: {
                    status: "ok"
                },
                errorRule: {
                    status: "error"
                },
                scope: $scope.id
            });
    }

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

            var servicesCodeUsed = _.filter(self.services, { isUsed: true });

            return $q.allSettled(_.map(servicesCodeUsed, function (service) {
                return getVoucherDetails(service.domain);
            })).then(function (result) {
                return result;
            }).catch(function (result) {
                return result;
            }).then(function (result) {
                _.times(result.length, function (index) {
                    if (result[index].status !== 404 || result[index].status !== 400) {
                        servicesCodeUsed[index].email = result[index].result.email;
                        servicesCodeUsed[index].url = hubicLoginUrl;
                    }
                });
            }).finally(function () {
                Poller.kill({
                    scope: $scope.id
                });
                return self.services;
            });
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
