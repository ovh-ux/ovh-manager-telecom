angular.module("managerApp").controller("TelecomPackMigrationServiceDeleteCtrl", function (PackMigrationProcess) {
    "use strict";

    var self = this;

    self.process = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.selectedSubServiceToDeleteReached = function (subService) {
        var count = _.filter(subService.services, {
            selected: true
        }).length;

        return count === subService.numberToDelete;
    };

    self.isValidSelection = function () {
        return _.every(self.process.selectedOffer.subServicesToDelete, function (subService) {
            return self.selectedSubServiceToDeleteReached(subService);
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.process = PackMigrationProcess.getMigrationProcess();

        self.chunkedSubServices = _.chunk(self.process.selectedOffer.subServicesToDelete, 2);
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
