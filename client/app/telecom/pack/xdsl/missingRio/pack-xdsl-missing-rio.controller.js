angular.module("managerApp").controller("PackXdslMissingRioCtrl", function ($q, $stateParams, $translate, OvhApiXdsl, Toast) {
    "use strict";
    var self = this;

    this.loading = true;

    this.init = function () {
        self.loading = true;

        self.missingRioForm = {};
        self.missingRioForm.portNumber = true;

        self.number = $stateParams.number;

        return OvhApiXdsl.v6().get({
            xdslId: $stateParams.serviceName
        }).$promise.then(function (data) {
            return data;
        }, function (err) {
            Toast.error([$translate.instant("xdsl_missing-rio_init_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
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

        return OvhApiXdsl.v6().updateInvalidOrMissingRio({
            xdslId: $stateParams.serviceName
        }, params).$promise.then(function () {
            Toast.success($translate.instant("xdsl_missing-rio_sent"));
            self.init();
        }, function (err) {
            Toast.error([$translate.instant("xdsl_missing-rio_error"), _.get(err, "data.message")].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.loading = false;
        });
    };

    this.init();
});
