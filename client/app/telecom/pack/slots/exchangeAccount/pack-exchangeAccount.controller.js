angular.module("managerApp").controller("PackExchangeAccountCtrl", function ($scope, $http, $stateParams, OvhApiPackXdslExchangeAccount, REDIRECT_URLS) {
    "use strict";

    var self = this;

    function init () {

        self.services = [];

        $scope.loaders = {
            services: true
        };

        return OvhApiPackXdslExchangeAccount.Services().v6().query({
            packName: $stateParams.packName
        }).$promise.then(function (serviceIds) {
            return $http.get("/email/exchange/*/service/*/account?$aggreg=1", {
                serviceType: "apiv7"
            }).then(function (servicesParam) {
                var services = servicesParam;
                services = _.get(services, "data");
                self.services = _.chain(services).filter(function (service) {
                    return service.value !== null;
                }).map(function (service) {
                    var splittedPath = service.path.split("/");
                    return angular.extend(service.value, {
                        organizationName: splittedPath[3],
                        exchangeService: splittedPath[5],
                        managerUrl: REDIRECT_URLS.exchangeAccount.replace("{organizationName}", splittedPath[3]).replace("{exchangeService}", splittedPath[5])
                    });
                }).filter(function (service) {
                    return serviceIds.indexOf(service.exchangeService + "-" + service.id) > -1;
                }).value();
            });
        }).finally(function () {
            $scope.loaders.services = false;
        });
    }

    init();

}
);
