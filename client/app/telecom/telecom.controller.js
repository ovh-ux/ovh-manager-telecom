angular.module("managerApp").controller("TelecomCtrl", class TelecomCtrl {
    constructor ($rootScope, OvhApiMe) {
        this.$rootScope = $rootScope;
        this.api = {
            me: OvhApiMe.Lexi()
        };
    }

    $onInit () {
        this.api.me.get().$promise.then(() => {
            this.$rootScope.managerPreloadHide += " manager-preload-hide";
        });
    }
});
