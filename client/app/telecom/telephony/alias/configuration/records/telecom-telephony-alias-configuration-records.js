angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.records', {
    url: '/records',
    abstract: true,
    translations: [
      'telecom/telephony/alias/configuration/records',
    ],
  });
});
