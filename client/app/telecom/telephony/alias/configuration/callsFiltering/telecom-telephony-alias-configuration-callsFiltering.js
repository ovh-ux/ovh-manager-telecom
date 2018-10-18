angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.callsFiltering', {
    url: '/callsFiltering',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/callsFiltering/telecom-telephony-alias-configuration-callsFiltering.html',
        controller: 'TelecomTelephonyAliasConfigurationCallsFilteringCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
