angular.module('managerApp').controller('PackHostedEmailCtrl', function ($q, $translate, $stateParams, Toast, OvhApiPackXdslHostedEmail) {
  const self = this;

  /**
     * Get the list of all hosted emails
     * @return {Promise}
     */
  this.loadServices = function () {
    this.loaders.services = true;

    return OvhApiPackXdslHostedEmail.v6().query({
      packId: $stateParams.packName,
    }).$promise.then((services) => {
      self.services = _.map(services, service => ({
        name: service,
        domain: service.replace(/^.+\./, '.'),
      }));
      return self.services;
    }).catch((err) => {
      Toast.error($translate.instant('hosted_email_loading_error'));
      return $q.reject(err);
    }).finally(() => {
      self.loaders.services = false;
    });
  };

  /**
     * Initialize controller
     */
  this.$onInit = function init() {
    this.services = [];
    this.loaders = {};

    return this.loadServices();
  };
});
