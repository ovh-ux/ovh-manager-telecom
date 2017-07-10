angular.module("managerApp").controller("TelecomPackMigrationCtrl", function ($q, $stateParams, $translate, PackMigrationProcess, Toast) {
    "use strict";

    var self = this;

    self.process = null;

    self.loading = {
        init: false
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;
        self.process = PackMigrationProcess.init($stateParams.packName);

        return PackMigrationProcess.checkForPendingMigration().then(function (pendingTasks) {
            if (pendingTasks && pendingTasks.length === 1) {
                self.process.currentStep = "migration";
                self.process.migrationTaskId = pendingTasks[0];
                self.process.migrationDoing = true;
            } else {
                self.process.currentStep = "offers";
            }
        }, function (error) {
            Toast.error([$translate.instant("telecom_pack_migration_offer_choice_error_loading"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
