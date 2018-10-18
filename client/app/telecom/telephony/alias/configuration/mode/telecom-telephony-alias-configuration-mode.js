angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.mode', {
    url: '/mode',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/mode/telecom-telephony-alias-configuration-mode.html',
        controller: 'TelecomTelephonyAliasConfigurationModeCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.', 'easyHunting'],
  });
});
