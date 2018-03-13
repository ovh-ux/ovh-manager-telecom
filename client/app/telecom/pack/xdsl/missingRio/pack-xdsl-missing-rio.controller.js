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
        }, function (err) {
            Toast.error(err);
        }).then(function () {
            self.loading = false;
        });
    };

    /**
     * Send Rio number
     */
    this.sendRio = function () {
        self.loading = true;

        return OvhApiXdsl.Lexi().updateInvalidOrMissingRio({
            xdslId: $stateParams.serviceName
        }, {
            relaunchWithoutPortability: false, // Was a useful checkbox, CX asked to remove it...
            rio: self.missingRioForm.rio
        }).$promise.then(function () {
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
