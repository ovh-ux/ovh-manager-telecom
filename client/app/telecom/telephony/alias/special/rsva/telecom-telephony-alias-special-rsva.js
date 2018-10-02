angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.special.rsva', {
    url: '/rsva',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/special/rsva/telecom-telephony-alias-special-rsva.html',
        controller: 'TelecomTelephonyAliasSpecialRsvaCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
