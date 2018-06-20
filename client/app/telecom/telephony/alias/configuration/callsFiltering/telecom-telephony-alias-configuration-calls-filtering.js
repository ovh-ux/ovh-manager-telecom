angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.callsFiltering', {
    url: '/callsFiltering',
    abstract: true,
  });
});
