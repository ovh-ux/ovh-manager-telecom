import _ from 'lodash';

export default class PackVoipEcoFaxCtrl {
  /* @ngInject */
  constructor(
    $q,
    $scope,
    $stateParams,
    OvhApiPackXdslVoipBillingAccount,
    OvhApiPackXdslVoipEcofax,
    REDIRECT_URLS,
  ) {
    this.$q = $q;
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.OvhApiPackXdslVoipBillingAccount = OvhApiPackXdslVoipBillingAccount;
    this.OvhApiPackXdslVoipEcofax = OvhApiPackXdslVoipEcofax;
    this.REDIRECT_URLS = REDIRECT_URLS;
  }

  $onInit() {
    this.details = this.$scope.service;
    this.packName = this.$stateParams.packName;
    this.services = [];

    this.loaders = {
      services: true,
    };

    // Get service link to this access from current Pack Xdsl
    return this.$q.all({
      ecofaxes: this.OvhApiPackXdslVoipEcofax.v6().query({
        packId: this.packName,
      }).$promise,
      billingAccount: this.OvhApiPackXdslVoipBillingAccount.v6().query({
        packId: this.packName,
      }).$promise,
    })
      .then(({ ecofaxes, billingAccount }) => {
        this.services = ecofaxes;
        this.billingAccount = _.first(billingAccount);
      })
      .finally(() => {
        this.loaders.services = false;
      });
  }
}
angular.module('managerApp').controller('PackVoipEcoFaxCtrl', PackVoipEcoFaxCtrl);
