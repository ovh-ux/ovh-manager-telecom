angular.module('managerApp').controller('TelecomTelephonyAliasCtrl', class TelecomTelephonyAliasCtrl {
  constructor(
    $q, $state, $stateParams, $translate,
    SidebarMenu, TelephonyMediator, TucToast,
    tucVoipService, voipServiceAlias,
  ) {
    this.$q = $q;
    this.$state = $state;
    this.$translate = $translate;
    this.SidebarMenu = SidebarMenu;
    this.TelephonyMediator = TelephonyMediator;
    this.TucToast = TucToast;
    this.tucVoipService = tucVoipService;
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
    this.tucVoipService.fetchSingleService(this.billingAccount, this.serviceName).then((alias) => {
      this.links = {
        order: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_order_new'),
        bank: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_bannMaker'),
        numberDirectory: this.TelephonyMediator.getV6ToV4RedirectionUrl('alias.number_manage_directory'),
      };
      if (alias) {
        this.alias = alias;
        return this.$q.all({
          convertToLineTask: this.voipServiceAlias.getConvertToLineTask(alias),
          terminationTask: this.tucVoipService.getTerminationTask(alias),
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
      this.TucToast.error([this.$translate.instant('telephony_alias_load_error'), _.get(error, 'data.message').join(' ')]);
    }).finally(() => {
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
        this.TucToast.error([this.$translate.instant('telephony_alias_rename_error', this.serviceName), _.get(error, 'data.message', error.message)].join(' '));
      });
    };
  }

  isContactCenterSolution() {
    return this.alias.isContactCenterSolution();
  }
});
