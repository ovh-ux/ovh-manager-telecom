angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.configuration.members', {
    url: '/members',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/configuration/members/telecom-telephony-alias-configuration-members.html',
        controller: 'TelecomTelephonyAliasConfigurationMembersCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
