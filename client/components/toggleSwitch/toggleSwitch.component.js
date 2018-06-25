angular.module('managerApp').component('toggleSwitch', {
  templateUrl: 'components/toggleSwitch/toggleSwitch.html',
  bindings: {
    ngModel: '=?',
    ngDisabled: '=?',
  },
  controller() {
    this.id = _.uniqueId('toggleSwitch');
  },
});
