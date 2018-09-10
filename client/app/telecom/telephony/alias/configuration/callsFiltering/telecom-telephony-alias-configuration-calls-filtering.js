angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.callsFiltering', {
    url: '/callsFiltering',
    abstract: true,
    translations: [
      'telecom/telephony/alias/configuration/callsFiltering',
    ],
  });
});
