angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.changeType', {
    url: '/changeType',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/changeType/telecom-telephony-alias-configuration-changeType.html',
        controller: 'TelecomTelephonyAliasConfigurationChangeTypeCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.', '..'],
  });
});
