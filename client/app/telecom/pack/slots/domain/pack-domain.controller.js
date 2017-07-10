angular.module("managerApp").controller("PackDomainCtrl", function ($scope, PackXdslDomainActivation, $stateParams, $window, REDIRECT_URLS) {
    "use strict";

    var self = this;

    this.getWebDomain = function (domainName) {
        return REDIRECT_URLS.domain.replace("{domain}", domainName);
    };

    var init = function init () {

        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        // Get service link to this access from current Pack Xdsl
        return PackXdslDomainActivation.Lexi().query({
            packId: $stateParams.packName
        }).$promise.then(
            function (services) {
                angular.forEach(services, function (service) {
                    self.services.push({
                        name: service,
                        encoded: $window.encodeURIComponent(service),
                        tld: service.replace(/^.+\./, ".")
                    });
                });
                $scope.loaders.services = false;
            },
            function () {
                $scope.loaders.services = false;
            }
        );
    };

    init();

}
);
