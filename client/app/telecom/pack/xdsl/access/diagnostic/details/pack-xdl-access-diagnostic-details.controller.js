angular.module('managerApp').controller('XdslDiagnosticDetailsCtrl', class XdslDiagnosticDetailsCtrl {
  constructor($state, $translate) {
    this.$state = $state;
    this.$translate = $translate;
  }

  $onInit() {
    this.loading = false;
    this.diagnostic = null;

    this.TrucService = {
      get: () => new Promise((resolve) => {
        resolve({
          isActiveOnLns: null,
          incident: null,
          remaining: 4,
          ping: null,
          capabilities: {
            isActiveOnLns: true,
            incident: true,
            ping: true,
            sync: true,
            isModemConnected: true,
            proposedProfileId: true,
            lineTest: true,
          },
          isModemConnected: null,
          diagnosticTime: '2018-11-06T16:06:15+01:00',
          lineDetails: null,
        });
      }),
    };
  }

  check() {
    this.loading = true;
    this.TrucService.get().then((diagnostic) => {
      this.diagnostic = diagnostic;
      this.statuses = Object.entries(_.pick(diagnostic, ['isActiveOnLns', 'ping', 'isModemConnected']))
        .map(kv => ({ key: kv[0], val: !!kv[1] }));
    }).finally(() => {
      this.loading = false;
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
