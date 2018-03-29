angular.module("managerApp").controller("PackVoipBillingAccountCtrl", function ($scope, OvhApiPackXdslVoipBillingAccount, $stateParams) {
    "use strict";
    var self = this;

    var init = function init () {

        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        // Get service link to this access from current Pack Xdsl
        return OvhApiPackXdslVoipBillingAccount.v6().query({
            packId: $stateParams.packName
        }).$promise.then(
            function (services) {
                angular.forEach(services, function (service) {
                    self.services.push(service);
                });

                $scope.loaders.services = false;
            },
            function () {
                $scope.loaders.services = false;
            }
        );
    };

    init();

});
