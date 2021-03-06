angular.module('managerApp').controller('TelecomTelephonyAliasConfigurationRedirectCtrl', class TelecomTelephonyAliasConfigurationRedirectCtrl {
  constructor($q, $state, $stateParams, $translate,
    alias, OvhApiTelephony, TucToast, tucVoipService, tucVoipServiceAlias, tucVoipServiceLine) {
    this.$q = $q;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.alias = alias;
    this.OvhApiTelephony = OvhApiTelephony;
    this.TucToast = TucToast;
    this.tucVoipService = tucVoipService;
    this.tucVoipServiceAlias = tucVoipServiceAlias;
    this.tucVoipServiceLine = tucVoipServiceLine;
  }

  $onInit() {
    this.loading = true;
    this.destination = null;
    this.newDestination = null;
    this.featureTypeToUse = this.featureTypeToUse || this.alias.featureType;

    this.billingAccount = this.$stateParams.billingAccount;
    this.serviceName = this.$stateParams.serviceName;

    return this.tucVoipServiceAlias.fetchRedirectNumber({
      billingAccount: this.billingAccount,
      serviceName: this.serviceName,
    }, this.featureTypeToUse)
      .then(({ destination }) => this.tucVoipService.fetchAll().then((allServices) => {
        this.destination = allServices
          .find(({ serviceName }) => _.isEqual(serviceName, destination));

        if (this.destination && this.canDestinationBeUsedForPresentation()) {
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
    }, serviceName, this.featureTypeToUse);
  }

  setNewDestination() {
    return (service) => {
      this.loading = true;
      this.newDestination = service;
      if (this.canChangeDestination()) {
        this.destinationUsedAsPresentation = false;
      }

      return this.tucVoipServiceLine.getPhone({
        billingAccount: service.billingAccount,
        serviceName: service.serviceName,
      }).then(() => {
        this.featureTypeToUse = 'redirect';
      }).catch((error) => {
        if (error.status === 404) {
          this.featureTypeToUse = 'ddi';
        } else {
          this.TucToast.error(`${this.$translate.instant('telephony_alias_config_redirect_get_error')} ${_.get(error, 'data.message', error.message)}`);
        }
      }).finally(() => {
        this.loading = false;
      });
    };
  }

  canDestinationBeUsedForPresentation() {
    const trunkOffer = 'trunk';
    const faxFeatureType = 'fax';
    const regExp = new RegExp(trunkOffer);
    if (this.newDestination) {
      return !regExp.test(_(this.newDestination).get('getPublicOffer.name', trunkOffer)) && this.newDestination.featureType !== faxFeatureType;
    }

    return !regExp.test(_(this.destination).get('getPublicOffer.name', trunkOffer)) && this.destination.featureType !== faxFeatureType;
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

  updateFeatureType() {
    if (this.alias.featureType !== this.featureTypeToUse) {
      return this.tucVoipServiceAlias.changeNumberFeatureType({
        billingAccount: this.billingAccount,
        serviceName: this.serviceName,
      }, this.featureTypeToUse);
    }

    return this.$q.when();
  }

  updateRedirection() {
    this.loading = true;

    return this.updateFeatureType().then(() => this.$q.all({
      updateRedirection: this.canChangeDestination()
        ? this.changeDestination(this.newDestination) : angular.noop(),
      updateLinePresentation: this.canUpdatePresentation()
        ? this.updateLinePresentation() : angular.noop(),
    }))
      .then(() => {
        this.TucToast.success(this.$translate.instant('telephony_alias_config_redirect_update_success'));
        this.OvhApiTelephony.Number().resetCache();
        this.OvhApiTelephony.Service().v6().resetCache();
        this.$onInit();
      })
      .catch((error) => {
        this.TucToast.error(
          `${this.$translate.instant('telephony_alias_config_redirect_update_error')} ${_(error).get('data.message', error.message)}`,
        );
      })
      .finally(() => {
        this.loading = false;
      });
  }
});
