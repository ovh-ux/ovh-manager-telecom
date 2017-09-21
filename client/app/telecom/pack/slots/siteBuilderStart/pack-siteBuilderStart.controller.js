angular.module("managerApp").controller("PackSiteBuilderStartCtrl", function ($scope, $http, $q, OvhApiPackXdslSiteBuilderStart, $stateParams) {
    "use strict";

    var self = this;

    function getSiteBuilderLoginUrl (siteBuilder) {
        return $http.get("/siteBuilder/trunk/ws.dispatcher/siteBuilderGetLogInUrl?params=" + JSON.stringify({ serviceName: siteBuilder }), {
            serviceType: "ws"
        }).then(function (loginParam) {
            var login = loginParam;
            login = _.get(login, "data.answer.logUrl");
            return login;
        });
    }

    var init = function init () {

        self.details = $scope.service;
        self.services = [];

        $scope.loaders = {
            services: true
        };

        var promises = [];

        // Get service link to this access from current Pack Xdsl
        return OvhApiPackXdslSiteBuilderStart.Lexi().query({
            packId: $stateParams.packName
        }).$promise.then(function (services) {
            angular.forEach(services, function (service) {
                promises.push(getSiteBuilderLoginUrl(service).then(function (login) {
                    self.services.push({
                        name: service,
                        login: login
                    });
                }));
            });
            return $q.all(promises);
        }).finally(function () {
            $scope.loaders.services = false;
        });
    };

    init();

});
