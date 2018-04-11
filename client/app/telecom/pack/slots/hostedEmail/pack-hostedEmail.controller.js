angular.module("managerApp").controller("PackHostedEmailCtrl", function ($q, $translate, $stateParams, Toast, OvhApiPackXdslHostedEmail) {
    "use strict";

    var self = this;

    /**
     * Get the list of all hosted emails
     * @return {Promise}
     */
    this.loadServices = function () {
        this.loaders.services = true;

        return OvhApiPackXdslHostedEmail.v6().query({
            packId: $stateParams.packName
        }).$promise.then(
            function (services) {
                self.services = _.map(services, function (service) {
                    return {
                        name: service,
                        domain: service.replace(/^.+\./, ".")
                    };
                });
                return self.services;
            }
        ).catch(function (err) {
            Toast.error($translate.instant("hosted_email_loading_error"));
            return $q.reject(err);
        }).finally(function () {
            self.loaders.services = false;
        });
    };

    /**
     * Initialize controller
     */
    this.$onInit = function init () {

        this.services = [];
        this.loaders = {};

        return this.loadServices();

    };

});
