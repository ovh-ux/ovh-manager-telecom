angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.timeCondition', {
    url: '/timeCondition',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/timeCondition/telecom-telephony-alias-configuration-time-condition.html',
        controller: 'TelecomTelephonyAliasConfigurationTimeConditionCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
