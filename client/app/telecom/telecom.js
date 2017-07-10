angular.module("managerApp").config(function ($stateProvider) {
    "use strict";
    $stateProvider.state("telecom", {
        url: "",
        templateUrl: "app/telecom/telecom.html",
        controller: "TelecomCtrl",
        controllerAs: "TelecomCtrl",
        "abstract": true,
        translations: ["common", "telecom"],
        resolve: {
            vipStatus: function ($q, TelecomMediator) {
                // this can be totally async. We don't force it to be resolved before loading state.
                TelecomMediator.initVipStatus();
                return $q.when({});
            },
            serviceCount: function (TelecomMediator) {
                return TelecomMediator.initServiceCount();
            }
        }
    });
});
