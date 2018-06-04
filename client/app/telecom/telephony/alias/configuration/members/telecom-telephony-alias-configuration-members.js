angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.members', {
    url: '/members',
    abstract: true,
  });
});
