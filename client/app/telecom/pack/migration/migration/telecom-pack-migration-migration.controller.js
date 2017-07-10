angular.module("managerApp").controller("TelecomPackMigrationMigrationCtrl", function ($scope, PackMigrationProcess) {
    "use strict";

    var self = this;

    self.loading = {
        migrate: false
    };
    self.process = null;
    self.migrationStatus = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.migrate = true;
        self.process = PackMigrationProcess.getMigrationProcess();

        return PackMigrationProcess.startTaskPolling().then(function () {
            self.migrationStatus = "success";
            self.loading.migrate = false;
        }, function () {
            self.migrationStatus = "error";
            self.loading.migrate = false;
        });
    }

    $scope.$on("$destroy", function () {
        PackMigrationProcess.stopTaskPolling();
    });

    /* -----  End of INITIALIZATION  ------*/

    init();

});
