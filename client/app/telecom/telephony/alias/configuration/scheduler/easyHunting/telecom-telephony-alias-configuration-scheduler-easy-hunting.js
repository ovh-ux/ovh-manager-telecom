angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.scheduler.easyHunting', {
    url: '/easyHunting',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/scheduler/easyHunting/telecom-telephony-alias-configuration-scheduler-easy-hunting.html',
        controller: 'TelecomTelephonyAliasConfigurationSchedulerEasyHuntingCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['common'],
  });
});
