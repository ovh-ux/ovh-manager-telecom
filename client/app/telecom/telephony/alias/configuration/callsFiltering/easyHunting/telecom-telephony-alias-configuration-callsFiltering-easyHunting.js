angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.callsFiltering.easyHunting', {
    url: '/easyHunting',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/callsFiltering/easyHunting/telecom-telephony-alias-configuration-callsFiltering-easyHunting.html',
        controller: 'TelecomTelephonyAliasConfigurationCallsFilteringEasyHuntingCtrl',
        controllerAs: 'CallsFilteringEasyHuntingCtrl',
      },
    },
    translations: ['common'],
  });
});
