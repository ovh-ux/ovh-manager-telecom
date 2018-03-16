angular.module("managerApp").controller("TelecomTelephonyLineAssistTroubleshootingProcedureCtrl", function ($stateParams, $scope, troubleshootingProcess, OvhApiTelephony) {
    "use strict";

    var self = this;

    self.process = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.process = troubleshootingProcess;

        if (self.process.problem.indexOf("phoneBook")) {
            OvhApiTelephony.Line().Phone().Phonebook().Lexi().query({
                billingAccount: $stateParams.billingAccount,
                serviceName: $stateParams.serviceName
            }).$promise.then(function (serverUrl) {
                self.process.siemensServerUrl = _.first(serverUrl);
            });
        }
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
