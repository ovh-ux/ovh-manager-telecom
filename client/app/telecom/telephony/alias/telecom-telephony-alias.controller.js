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
    this.alias = null;
    this.links = null;
    this.terminationTask = null;

    this.fetchService();
  }

  fetchService() {
    this.loading = true;
    this.voipService.fetchSingleService(this.billingAccount, this.serviceName).then((alias) => {
      this.links = {
        order: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_order_new'),
        bank: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_bannMaker'),
        numberDirectory: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_manage_directory'),
      };
      if (alias) {
        this.alias = alias;
        return this.$q.all({
          convertToLineTask: this.voipServiceAlias.getConvertToLineTask(alias),
          terminationTask: this.voipService.getTerminationTask(alias),
          isSpecialNumber: this.voipServiceAlias.isSpecialNumber(alias),
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
      this.$state.go('telecom.telephony.alias.dashboard');
      this.loading = false;
    });
  }

  hasConsumption() {
    const typesWithoutConsumption = ['redirect', 'ddi', 'conference', 'empty'];
    return !typesWithoutConsumption.includes(this.alias.featureType);
  }

  aliasDescriptionSave() {
    return (newServiceDescription) => {
      const oldDescription = this.alias.description;
      this.alias.description = newServiceDescription;

      return this.voipServiceAlias.editDescription(this.alias).then(() => {
        this.SidebarMenu.updateItemDisplay({
          title: this.alias.getDisplayedName(),
        }, this.alias.serviceName, 'telecom-telephony-section', this.alias.billingAccount);
      }).catch((error) => {
        this.alias.description = oldDescription;
        this.Toast.error([this.$translate.instant('telephony_alias_rename_error', this.serviceName), _.get(error, 'data.message', error.message)].join(' '));
      });
    };
  }
});
