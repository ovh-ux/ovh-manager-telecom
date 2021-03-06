angular.module('managerApp').controller('XdslDiagnosticDetailsCtrl', class XdslDiagnosticDetailsCtrl {
  constructor($rootScope, $scope, $state, $translate) {
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$state = $state;
    this.$translate = $translate;
  }

  $onInit() {
    this.diagnostic = null;
    this.statuses = null;

    this.$scope.$on('accessDiagnosticDetails:arrived', (event, diagnostic) => {
      this.diagnostic = diagnostic;
      this.statuses = this.constructor.getStatuses(diagnostic || {});
    });

    this.$rootScope.$emit('accessDiagnosticDetails:get');
  }

  reload() {
    this.diagnostic = null;
    this.$rootScope.$emit('accessDiagnosticDetails:launch');
  }

  static getStatuses(diagnostic) {
    return Object.entries(_.pick(diagnostic, ['isActiveOnLns', 'ping', 'isModemConnected']))
      .map(([key, value]) => ({ key, val: !!value }));
  }

  getRemainingChecksText() {
    const checkText = this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_check');

    if (_.has(this.diagnostic, 'remaining')) {
      return `${checkText} ${this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_remaining_checks', {
        remainingChecks: this.diagnostic.remaining,
      })}`;
    }

    if (_.get(this.diagnostic, 'remaining') === 0) {
      return this.$translate.instant('xdsl_details_diagnostic_modal_relaunch_status_no_remaining_checks');
    }

    return checkText;
  }
});
