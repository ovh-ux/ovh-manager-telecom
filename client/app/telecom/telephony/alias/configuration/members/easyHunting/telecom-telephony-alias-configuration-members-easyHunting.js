angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.members.easyHunting', {
    url: '/easyHunting',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/members/easyHunting/telecom-telephony-alias-configuration-members-easyHunting.html',
        controller: 'TelecomTelephonyAliasConfigurationMembersEasyHuntingCtrl',
        controllerAs: 'MembersEasyHuntingCtrl',
      },
    },
    translations: ['common'],
  });
});
