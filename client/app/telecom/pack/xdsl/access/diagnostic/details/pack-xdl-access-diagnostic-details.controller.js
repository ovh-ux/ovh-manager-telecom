angular.module('managerApp').controller('XdslDiagnosticDetailsCtrl', class XdslDiagnosticDetailsCtrl {
  constructor($state, $stateParams, $translate, OvhApiXdslDiagnostic) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$translate = $translate;
    this.XdslDiagnostic = OvhApiXdslDiagnostic.v6();
  }

  $onInit() {
    this.serviceName = this.$stateParams.serviceName;

    this.loading = true;
    this.diagnostic = null;
    this.getDiagnostic().finally(() => {
      this.loading = false;
    });
  }

  check() {
    this.loading = true;
    return this.XdslDiagnostic.launchDiagnostic({ xdslId: this.serviceName }, {}).$promise
      .then(() => this.getDiagnostic())
      .finally(() => {
        this.loading = false;
      });
  }

  getDiagnostic() {
    return this.XdslDiagnostic.get({ xdslId: this.serviceName }).$promise
      .then((diagnostic) => {
        this.diagnostic = diagnostic;
        this.statuses = Object.entries(_.pick(diagnostic, ['isActiveOnLns', 'ping', 'isModemConnected']))
          .map(kv => ({ key: kv[0], val: !!kv[1] }));
      });
  }

  getRemainingChecksText() {
    const checkText = this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_check');

    if (this.diagnostic && this.diagnostic.remaining) {
      return `${checkText} ${this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_remaining_checks', { t0: this.diagnostic.remaining })}`;
    }

    if (this.diagnostic && this.diagnostic.remaining === 0) {
      return this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_no_remaining_checks');
    }

    return checkText;
  }
});
