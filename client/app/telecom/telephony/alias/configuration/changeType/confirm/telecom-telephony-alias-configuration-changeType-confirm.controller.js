angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationChangeTypeConfirmCtrl', class TelecomTelephonyAliasConfigurationChangeTypeConfirmCtrl {
  constructor($uibModalInstance, currentFeatureType) {
    this.$uibModalInstance = $uibModalInstance;
    this.currentFeatureType = currentFeatureType;
  }

  confirm() {
    this.$uibModalInstance.close();
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
});
