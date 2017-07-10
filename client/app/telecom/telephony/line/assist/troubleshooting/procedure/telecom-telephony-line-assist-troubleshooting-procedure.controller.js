angular.module("managerApp").controller("TelecomTelephonyLineAssistTroubleshootingProcedureCtrl", function (troubleshootingProcess) {
    "use strict";

    var self = this;

    self.process = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.process = troubleshootingProcess;
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
