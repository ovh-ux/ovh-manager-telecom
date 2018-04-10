angular.module("managerApp").controller("PackHubicCtrl", class {

    constructor ($q, $scope, $stateParams, $translate, OvhApiPackXdslHubic, Poller, Toast, URLS) {
        this.$q = $q;
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.OvhApiPackXdslHubic = OvhApiPackXdslHubic;
        this.Poller = Poller;
        this.Toast = Toast;
        this.URLS = URLS;
    }

    /**
     * Get detail of a domain voucher already used
     * @param  {string} domain
     */
    getVoucherDetails (domain) {
        const url = `/pack/xdsl/${this.$stateParams.packName}/hubic/services/${domain}/details`;

        return this.Poller.poll(
            url,
            null,
            {
                successRule: {
                    status: "ok"
                },
                errorRule: {
                    status: "error"
                },
                scope: this.$scope.id
            });
    }

    /**
     * Load all hubic services
     * @return {Promise}
     */
    loadHubics () {
        this.loaders.services = true;
        this.services = [];

        return this.OvhApiPackXdslHubic.Aapi().query({
            packId: this.$stateParams.packName
        }).$promise.then((services) => {
            this.services = _.map(services, (service) => {
                const voucherUrl = [this.URLS.hubicVoucher, "token=" + service.voucher].join("?");
                return _.extend(
                    service,
                    {
                        url: service.voucher ? voucherUrl : this.URLS.hubicLogin
                    }
                );
            });

            const servicesCodeUsed = _.filter(this.services, { isUsed: true });

            this.loaders.voucher = !!servicesCodeUsed.length;

            this.$q.allSettled(_.map(servicesCodeUsed, (service) => this.getVoucherDetails(service.domain)))
                .then((result) => result)
                .catch((result) => result)
                .then((result) => {
                    _.times(result.length, (index) => {
                        if (result[index].status !== 404 && result[index].status !== 400) {
                            servicesCodeUsed[index].email = result[index].result.email;
                        } else {
                            servicesCodeUsed[index].email = this.$translate.instant("pack_xdsl_hubic_used_email_unavailable");
                        }
                        servicesCodeUsed[index].url = this.URLS.hubicLogin;
                    });
                }).finally(() => {
                    this.Poller.kill({
                        scope: this.$scope.id
                    });
                    this.loaders.voucher = false;
                });

            return this.services;
        }).catch((err) => {
            this.Toast.error([this.$translate.instant("pack_xdsl_hubic_loading_error"), err.message].join(" "));
            return this.$q.reject(err);
        }).finally(() => {
            this.loaders.services = false;
        });
    }

    /**
     * Initialize controller
     */
    $onInit () {
        this.loaders = {
            services: true,
            voucher: false
        };

        // Get service link to this access from current Pack Xdsl
        this.loadHubics();
    }

    $onDestroy () {
        this.Poller.kill({
            scope: this.$scope.$id
        });
    }

});
