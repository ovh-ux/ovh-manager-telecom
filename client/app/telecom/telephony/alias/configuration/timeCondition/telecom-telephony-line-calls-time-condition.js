angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.timeCondition', {
    url: '/timeCondition',
    abstract: true,
  });
});
