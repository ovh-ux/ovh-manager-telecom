angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationRedirectCtrl', class TelecomTelephonyAliasConfigurationRedirectCtrl {
  constructor($q, $stateParams, $translate,
    alias, TucToast, tucVoipService, tucVoipServiceAlias, tucVoipServiceLine) {
    this.$q = $q;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.alias = alias;
    this.TucToast = TucToast;
    this.tucVoipService = tucVoipService;
    this.tucVoipServiceAlias = tucVoipServiceAlias;
    this.tucVoipServiceLine = tucVoipServiceLine;
  }

  $onInit() {
    this.loading = true;
    this.destination = null;
    this.newDestination = null;

    this.billingAccount = this.$stateParams.billingAccount;
    this.serviceName = this.$stateParams.serviceName;

    return this.tucVoipServiceAlias.fetchRedirectNumber({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    })
      .then(({ destination }) => this.tucVoipService.fetchAll().then((allServices) => {
        this.destination = allServices
          .find(({ serviceName }) => _.isEqual(serviceName, destination));

        if (this.destination) {
          return this.tucVoipServiceLine.getLineOptions({
            billingAccount: this.destination.billingAccount,
            serviceName: this.destination.serviceName,
          }).then(({ displayNumber }) => {
            this.destinationUsedAsPresentation = _.isEqual(displayNumber, this.alias.serviceName);
            this.actualPresentation = this.destinationUsedAsPresentation;
            return displayNumber;
          });
        }

        return destination;
      }))
      .catch((error) => {
        this.TucToast.error(
          `${this.$translate.instant('telephony_alias_config_redirect_get_error')} ${_(error).get('data.message', error.message)}`,
        );
      })
      .finally(() => {
        this.loading = false;
      });
  }

  changeDestination({ serviceName }) {
    return this.tucVoipServiceAlias.changeDestinationRedirectNumber({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }, serviceName);
  }

  setNewDestination() {
    return (service) => {
      this.newDestination = service;
      if (this.canChangeDestination()) {
        this.destinationUsedAsPresentation = false;
      }
    };
  }

  isDestinationNotTrunkLine() {
    const trunkOffer = 'trunk';
    const regExp = new RegExp(trunkOffer);
    if (this.newDestination) {
      return !regExp.test(_(this.newDestination).get('getPublicOffer.name', trunkOffer));
    }

    return !regExp.test(_(this.destination).get('getPublicOffer.name', trunkOffer));
  }

  canChangeDestination() {
    const currentDestination = _(this.destination).get('serviceName', '');
    const newDestination = _(this.newDestination).get('serviceName', currentDestination);
    return !_.isEqual(currentDestination, newDestination);
  }

  canUpdatePresentation() {
    if (this.canChangeDestination()) {
      return this.destinationUsedAsPresentation;
    }

    return !_.isEqual(this.actualPresentation, this.destinationUsedAsPresentation);
  }

  canUpdateRedirection() {
    return this.canChangeDestination() || this.canUpdatePresentation();
  }

  updateLinePresentation() {
    const destination = this.newDestination || this.destination;

    return this.tucVoipServiceLine.changeLineOptions({
      billingAccount: destination.billingAccount,
      serviceName: destination.serviceName,
    }, {
      displayNumber: this.destinationUsedAsPresentation ? this.alias.serviceName : '',
    });
  }

  updateRedirection() {
    this.loading = true;
    return this.$q.all({
      updateRedirection: this.canChangeDestination()
        ? this.changeDestination(this.newDestination) : angular.noop(),
      updateLinePresentation: this.canUpdatePresentation()
        ? this.updateLinePresentation() : angular.noop(),
    }).then(() => {
      this.TucToast.success('telephony_alias_config_redirect_update_success');
      this.$onInit();
    }).catch((error) => {
      this.TucToast.error(
        `${this.$translate.instant('telephony_alias_config_redirect_update_error')} ${_(error).get('data.message', error.message)}`,
      );
    }).finally(() => {
      this.loading = false;
    });
  }

  resetParams() {
    this.newDestination = null;
    this.destinationUsedAsPresentation = this.actualPresentation;
  }
});
