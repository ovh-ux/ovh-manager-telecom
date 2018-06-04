angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.scheduler.ovhPabx', {
    url: '/ovhPabx',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/scheduler/ovhPabx/telecom-telephony-alias-configuration-scheduler-ovh-pabx.html',
        controller: 'TelecomTelephonyAliasConfigurationSchedulerOvhPabxCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['common'],
  });
});
