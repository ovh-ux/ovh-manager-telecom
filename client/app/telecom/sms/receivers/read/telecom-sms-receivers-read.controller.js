angular.module("managerApp").controller("TelecomSmsReceiversReadCtrl", function ($stateParams, $translate, $uibModalInstance, receiver, csv) {
    "use strict";

    var self = this;

    self.receiver = angular.copy(receiver);
    self.csv = angular.copy(csv);

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setFilename = function () {
        return _.kebabCase([
            $stateParams.serviceName,
            $translate.instant("sms_tabs_contacts"),
            self.receiver.description
        ].join()) + ".csv";
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    /* -----  End of INITIALIZATION  ------*/
});
