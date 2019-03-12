export default class PackVoipEcoFaxCtrl {
  /* @ngInject */
  constructor(
    $scope,
    $stateParams,
    OvhApiPackXdslVoipEcofax,
    REDIRECT_URLS,
  ) {
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.OvhApiPackXdslVoipEcofax = OvhApiPackXdslVoipEcofax;
    this.REDIRECT_URLS = REDIRECT_URLS;
  }

  $onInit() {
    this.details = this.$scope.service;
    this.services = [];

    this.$scope.loaders = {
      services: true,
    };

    // Get service link to this access from current Pack Xdsl
    return this.OvhApiPackXdslVoipEcofax.v6().query({
      packId: this.$stateParams.packName,
    }).$promise.then(
      (services) => {
        angular.forEach(services, (service) => {
          this.services.push(service);
        });

        this.$scope.loaders.services = false;
      },
      () => {
        this.$scope.loaders.services = false;
      },
    );
  }

  generateV3Url(service) {
    // Build link to manager v3 for fax
    return this.REDIRECT_URLS.telephony.replace('{line}', service);
  }
}
angular.module('managerApp').controller('PackVoipEcoFaxCtrl', PackVoipEcoFaxCtrl);
