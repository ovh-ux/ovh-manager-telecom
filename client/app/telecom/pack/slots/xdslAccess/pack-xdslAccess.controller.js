/* global async */
angular.module("managerApp").controller("PackAccessCtrl", function ($scope, PackXdslAccess, XdslLines, $stateParams) {
    "use strict";

    var self = this;
    var init = function init () {
        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        // Get service link to this access from current Pack Xdsl
        return PackXdslAccess.Aapi().query({
            packId: $stateParams.packName
        }).$promise.then(
            function (services) {
                async.map(services, function (service, callback) {
                    XdslLines.Lexi().query({
                        xdslId: service.accessName
                    }).$promise.then(function (lines) {
                        service.lines = lines;
                        callback(null, service);
                    }, function (err) {
                        callback(err);
                    });
                }, function (err, results) {
                    if (err) {
                        return;
                    }

                    angular.forEach(results, function (result) {
                        self.services.push(result);
                    });

                    $scope.loaders.services = false;
                });
            },
            function () {
                $scope.loaders.services = false;
            }
        );
    };

    init();

});
