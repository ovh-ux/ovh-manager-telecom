angular.module("managerApp").run(($rootScope, $state) => {

    $rootScope.$on("$stateChangeSuccess", () => {
        if (!$state.includes("telecom")) {
            $rootScope.managerPreloadHide += " manager-preload-hide";
        }
    });

});
