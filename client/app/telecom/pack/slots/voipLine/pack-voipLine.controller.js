angular.module("managerApp").controller("PackVoipLineCtrl", function ($scope, PackXdslVoipLine, $stateParams) {
    "use strict";

    var self = this;

    var init = function init () {

        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        // Get service link to this access from current Pack Xdsl
        return PackXdslVoipLine.Aapi().query({
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
