angular.module('managerApp').controller('TelecomTelephonyAliasCtrl', class TelecomTelephonyAliasCtrl {
  constructor(
    $q, $state, $stateParams, $translate,
    SidebarMenu, TelephonyMediator, Toast,
    voipService, voipServiceAlias,
  ) {
    this.$q = $q;
    this.$state = $state;
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.TelephonyMediator = TelephonyMediator;
    this.Toast = Toast;
    this.voipService = voipService;
    this.voipServiceAlias = voipServiceAlias;

    this.billingAccount = $stateParams.billingAccount;
    this.serviceName = $stateParams.serviceName !== 'default' ? $stateParams.serviceName : null;
  }

  $onInit() {
    this.number = null;
    this.links = null;
    this.terminationTask = null;

    this.fetchService();
  }

  fetchService() {
    this.loading = true;
    this.voipService.fetchSingleService(this.billingAccount, this.serviceName).then((number) => {
      this.links = {
        order: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_order_new'),
        bank: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_bannMaker'),
        numberDirectory: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_manage_directory'),
      };
      if (number) {
        this.number = number;
        return this.$q.all({
          convertToLineTask: this.voipServiceAlias.getConvertToLineTask(number),
          terminationTask: this.voipService.getTerminationTask(number),
          isSpecialNumber: this.voipServiceAlias.isSpecialNumber(number),
        }).then((result) => {
          this.convertTask = result.convertToLineTask;
          this.terminationTask = result.terminationTask;
          this.isSpecialNumber = result.isSpecialNumber;

          return result;
        });
      }
      return null;
    }).catch((error) => {
      this.Toast.error([this.$translate.instant('telephony_alias_load_error'), _.get(error, 'data.message').join(' ')]);
    }).finally(() => {
      this.loading = false;
    });
  }

  hasConsumption() {
    const typesWithoutConsumption = ['redirect', 'ddi', 'conference', 'empty'];
    return !typesWithoutConsumption.includes(this.number.featureType);
  }

  numberDescriptionSave() {
    return (newServiceDescription) => {
      const oldDescription = this.number.description;
      this.number.description = newServiceDescription;

      return this.voipServiceAlias.editDescription(this.number).then(() => {
        this.SidebarMenu.updateItemDisplay({
          title: this.number.getDisplayedName(),
        }, this.number.serviceName, 'telecom-telephony-section', this.number.billingAccount);
      }).catch((error) => {
        this.number.description = oldDescription;
        this.Toast.error([this.$translate.instant('telephony_alias_rename_error', this.serviceName), _.get(error, 'data.message', error.message)].join(' '));
      });
    };
  }
});
