angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.statistics', {
    url: '/statistics',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/feature/contactCenterSolution/statistics/telecom-telephony-alias-configuration-statistics.html',
        controller: 'TelecomTelephonyAliasConfigurationStatisticsCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
