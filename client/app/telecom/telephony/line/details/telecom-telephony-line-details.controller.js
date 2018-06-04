angular.module('managerApp').controller('TelecomTelephonyLineDetailsCtrl', function ($q, $stateParams, TelephonyMediator, NumberPlans, currentLine) {
  const self = this;

  self.loading = {
    init: false,
  };
  self.lastRegistration = null;

  /*= =====================================
    =            INITIALIZATION            =
    ====================================== */

  function init() {
    self.loading.init = true;

    TelephonyMediator.getGroup($stateParams.billingAccount).then((group) => {
      self.group = group;
      self.line = _.merge(self.group.getLine($stateParams.serviceName), currentLine || {});
      self.line.getPublicOffer.description = self.line.getPublicOffer.description.replace('The Public Reference has an error', '-');
      self.plan = NumberPlans.getPlanByNumber(self.line);

      return $q.all({
        phone: self.line.getPhone(),
        options: self.line.getOptions(),
        ips: self.line.getIps(),
        lastRegistrations: self.line.getLastRegistrations(),
      }).then(() => {
        if (self.line.lastRegistrations && self.line.lastRegistrations.length) {
          self.lastRegistration = _.last(_.sortBy(self.line.lastRegistrations, reg =>
            new Date(reg.datetime)));
        }
      });
    }).finally(() => {
      self.loading.init = false;
    });
  }

  /* -----  End of INITIALIZATION  ------*/

  init();
});
