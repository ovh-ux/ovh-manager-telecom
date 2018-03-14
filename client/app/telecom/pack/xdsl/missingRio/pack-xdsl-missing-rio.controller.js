angular.module("managerApp").controller("PackXdslMissingRioCtrl", function ($scope, $stateParams, $translate, $q, $timeout, $filter, OvhApiXdsl, Toast) {
    "use strict";
    var self = this;

    this.loading = true;

    this.init = function () {
        self.loading = true;

        self.missingRioForm = {};
        self.missingRioForm.portNumber = true;

        self.number = $stateParams.number;

        return OvhApiXdsl.Lexi().get({
            xdslId: $stateParams.serviceName
        }).$promise.then(function (data) {
            return data;
        }, function () {
            Toast.error($translate.instant("xdsl_missing-rio_init_error"));
        }).then(function () {
            self.loading = false;
        });
    };

    /**
     * Send Rio number
     */
    this.sendRio = function () {
        self.loading = true;

        var params = { relaunchWithoutPortability: self.missingRioForm.portNumber };
        if (!self.missingRioForm.portNumber) {
            params.rio = self.missingRioForm.rio;
        }

        return OvhApiXdsl.Lexi().updateInvalidOrMissingRio({
            xdslId: $stateParams.serviceName
        }, params).$promise.then(function () {
            Toast.success($translate.instant("xdsl_missing-rio_sent"));
            self.init();
        }, function () {
            Toast.error($translate.instant("xdsl_missing-rio_error"));
        }).finally(function () {
            self.loading = false;
        });
    };

    this.init();
});
