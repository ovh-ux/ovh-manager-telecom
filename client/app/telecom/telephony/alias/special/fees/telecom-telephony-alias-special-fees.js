angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.special.fees', {
    url: '/fees',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/special/fees/telecom-telephony-alias-special-fees.html',
        controller: 'TelecomTelephonyAliasSpecialFeesCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
