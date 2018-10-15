angular.module('managerApp').controller('TelecomPackMigrationConfirmCtrl', function ($q, $translate, PackMigrationProcess, Toast) {
  const self = this;

  self.process = null;
  self.loading = {
    migrate: false,
  };
  self.choosedAdditionalOptions = null;
  self.model = {
    acceptContracts: false,
  };
  self.modemTransportPrice = 9.99;

  /*= ==============================
  =            HELPERS            =
  =============================== */

  self.getOptionPrice = function (option) {
    return PackMigrationProcess.getPriceStruct(option.optionalPrice.value * option.choosedValue);
  };

  self.getFirstMensuality = function () {
    return PackMigrationProcess
      .getPriceStruct(self.process.selectedOffer.displayedPrice.value + 9.99);
  };

  self.getServiceToDeleteList = function (subService) {
    return _.pluck(_.filter(subService.services, {
      selected: true,
    }), 'name').join(', ');
  };

  /* -----  End of HELPERS  ------*/

  /*= ==============================
  =            ACTIONS            =
  =============================== */

  self.startMigration = function () {
    self.loading.migrate = true;
    return PackMigrationProcess.startMigration().then((migrationTask) => {
      self.process.migrationTaskId = migrationTask.id;
      self.process.currentStep = 'migration';
    }, (error) => {
      Toast.error([$translate.instant('telecom_pack_migration_error'), _.get(error, 'data.message', '')].join(' '));
      return $q.reject(error);
    }).finally(() => {
      self.loading.migrate = false;
    });
  };

  /* -----  End of ACTIONS  ------*/

  /*= =====================================
  =            INITIALIZATION            =
  ====================================== */

  function init() {
    self.process = PackMigrationProcess.getMigrationProcess();
    self.choosedAdditionalOptions = PackMigrationProcess.getOptionsSelected();
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
