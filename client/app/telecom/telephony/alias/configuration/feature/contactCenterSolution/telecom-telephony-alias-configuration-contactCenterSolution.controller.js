angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationContactCenterSolutionCtrl', class TelecomTelephonyAliasConfigurationContactCenterSolutionCtrl {
  constructor($state, $translate, $uibModal, alias, OvhApiTelephony, Toast) {
    this.$state = $state;
    this.$translate = $translate;
    this.$uibModal = $uibModal;
    this.alias = alias;
    this.OvhApiTelephony = OvhApiTelephony;
    this.Toast = Toast;
  }

  deleteConfiguration() {
    this.$uibModal.open({
      templateUrl: 'app/telecom/telephony/alias/dashboard/confirmDeleteConfiguration/confirmDeleteConfiguration.modal.html',
      controller: 'TelecomTelephonyAliasConfirmDeleteConfigurationCtrl',
      controllerAs: '$ctrl',
      backdrop: 'static',
      resolve: {
        number: this.alias,
      },
    }).result.then(() => {
      this.OvhApiTelephony.Service().v6().resetCache();
      this.$state.go('telecom.telephony.alias').then(() => { this.$state.reload(); });
    }).catch((error) => {
      if (error) {
        this.Toast.error(
          `${this.$translate.instant('telephony_alias_delete_ko')} ${_.get(error, 'data.message', error.message)}`,
        );
      }
    });
  }
});
