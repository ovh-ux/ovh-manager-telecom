angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.scheduler', {
    url: '/scheduler',
    abstract: true,
  });
});
