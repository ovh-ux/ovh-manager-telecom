angular.module('managerApp').controller('TelecomTelephonyAliasConfirmDeleteConfigurationCtrl',
  class TelecomTelephonyAliasConfirmDeleteConfigurationCtrl {
    constructor($uibModalInstance, number, voipServiceAlias) {
      this.$uibModalInstance = $uibModalInstance;

      this.number = number;
      this.voipServiceAlias = voipServiceAlias;
    }

    confirm() {
      const emptyType = 'empty';

      this.loading = true;
      this.voipServiceAlias.changeNumberFeatureType(this.number, emptyType).then(() => {
        this.$uibModalInstance.close();
      }).catch((error) => {
        this.$uibModalInstance.dismiss(error);
      }).finally(() => {
        this.loading = false;
      });
    }

    cancel() {
      if (!this.loading) {
        this.$uibModalInstance.dismiss();
      }
    }
  });
