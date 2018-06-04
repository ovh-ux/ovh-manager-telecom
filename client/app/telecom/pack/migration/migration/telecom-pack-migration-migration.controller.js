angular.module('managerApp').controller('TelecomPackMigrationMigrationCtrl', function ($scope, PackMigrationProcess) {
  const self = this;

  self.loading = {
    migrate: false,
  };
  self.process = null;
  self.migrationStatus = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.loading.migrate = true;
    self.process = PackMigrationProcess.getMigrationProcess();

    return PackMigrationProcess.startTaskPolling().then(() => {
      self.migrationStatus = 'success';
      self.loading.migrate = false;
    }, () => {
      self.migrationStatus = 'error';
      self.loading.migrate = false;
    });
  }

  $scope.$on('$destroy', () => {
    PackMigrationProcess.stopTaskPolling();
  });

  /* -----  End of INITIALIZATION  ------*/

  init();
});
