angular.module("managerApp").controller("XdslDiagnosticCtrl", function ($q, $scope, $stateParams, $translate, OvhApiXdslDiagnostic, Poller, Toast, OvhApiMeVipStatus) {
    "use strict";
    var self = this;

    this.xdslId = $stateParams.serviceName;

    self.status = {
        pollerRunning: false,
        diagnosticRunning: true,
        init: false
    };

    self.diagnostic = null;
    self.isVIP = false;

    /**
     * Initialize the controller
     */
    self.init = function () {
        self.status.init = true;
        self.wizardTypeSelection = "type1";

        // if error in API call, you are not VIP by default
        return OvhApiMeVipStatus.v6().get().$promise.then(function (data) {
            self.isVIP = data.telecom;
            self.launchPoller();
        }).finally(function () {
            self.status.init = false;
        });
    };

    /**
     * Gives a global status on the diagnostic
     *   - true = all is ok
     *   - false = something failed
     */
    self.isDiagnosticOk = function () {
        var isOk = function (obj, fieldName) {
            if (self.diagnostic && self.diagnostic.capabilities[fieldName] && !obj[fieldName]) {
                return false;
            }
            return true;
        };
        var status = isOk(self.diagnostic, "ping") && isOk(self.diagnostic, "isModemConnected");
        if (self.diagnostic && self.diagnostic.lineDetails) {
            for (var i = 0; i < self.diagnostic.lineDetails.length; i++) {
                status = status && isOk(self.diagnostic.lineDetails[i], "sync");
            }
        }
        return status;
    };

    /**
     * Launch a diagnostic
     */
    self.launchDiagnostic = function () {
        // erase old diagnostic
        self.diagnostic = null;

        // disable "launch" button
        self.status.diagnosticRunning = true;
        OvhApiXdslDiagnostic.v6().launchDiagnostic({
            xdslId: $stateParams.serviceName
        }, null).$promise.then(function (data) {
            angular.extend(self.status, data);
            self.launchPoller();
        }, function (err) {
            Toast.error($translate.instant("pack_xdsl_access_diagnostic_line_error_diag_launch"));
            return $q.reject(err);
        });
    };

    /**
     * Invoked by the poller on each aapi call to get diagnostic information
     * @param {object} result Response from aapi
     */
    self.pollerSuccess = function (result) {
        self.status.pollerRunning = result !== 404;
        self.status.diagnosticRunning = typeof result.diagnosticDone === "boolean" ? !result.diagnosticDone : false;
        if (self.status.pollerRunning && result.diagnosticDone) {
            // poller can be stopped as, the complete diagnostic was retrieved
            Poller.kill({
                scope: $scope.$id
            });
            self.status.pollerRunning = false;
        }
        if (typeof result === "object") {
            self.diagnostic = result;
            self.diagnostic.mainLine = result.lineDetails && result.lineDetails.length ? result.lineDetails[0] : null;
        }
    };

    /**
     * Launch the poller if no instance is running yet
     */
    self.launchPoller = function () {
        if (!self.status.pollerRunning) {
            self.status.pollerRunning = true;
            OvhApiXdslDiagnostic.Aapi().poll($scope, {
                xdslId: $stateParams.serviceName
            }).then(
                self.pollerSuccess,
                function (error) {
                    if (!_.isObject(error)) {
                        Toast.error($translate.instant("pack_xdsl_access_diagnostic_line_error_diag_poll"));
                    }
                },
                self.pollerSuccess
            );
        }
    };

    self.init();

});
