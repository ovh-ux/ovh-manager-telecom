angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.fax.management', {
    url: '/management',
    abstract: true,
    translations: [
      'telecom/telephony/fax/management',
    ],
  });
});
