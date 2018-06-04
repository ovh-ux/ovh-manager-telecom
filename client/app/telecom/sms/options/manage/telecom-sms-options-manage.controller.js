angular.module('managerApp').controller('TelecomSmsOptionsManageCtrl', class TelecomSmsOptionsManageCtrl {
  constructor($uibModal, SmsMediator, ToastError) {
    this.$uibModal = $uibModal;
    this.SmsMediator = SmsMediator;
    this.ToastError = ToastError;
  }

  $onInit() {
    this.loading = {
      init: false,
    };
    this.service = null;

    this.loading.init = true;
    return this.SmsMediator.initDeferred.promise.then(() => {
      this.service = this.SmsMediator.getCurrentSmsService();
    }).catch((err) => {
      this.ToastError(err);
    }).finally(() => {
      this.loading.init = false;
    });
  }

  /**
     * Opens a modal to manage sms' options.
     * @param  {Object} service SmsService.
     */
  update(service) {
    this.$uibModal.open({
      animation: true,
      templateUrl: 'app/telecom/sms/options/manage/update/telecom-sms-options-manage-update.html',
      controller: 'TelecomSmsOptionsManageUpdateCtrl',
      controllerAs: 'OptionsManageUpdateCtrl',
      resolve: { service: () => service },
    });
  }
});
