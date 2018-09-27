angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.special.transfer', {
    url: '/transfer',
    views: {
      'aliasView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/special/transfer/telecom-telephony-alias-special-transfer.html',
        controller: 'TelecomTelephonyAliasSpecialTransferCtrl',
        controllerAs: '$ctrl',
      },
    },
    translations: ['.'],
  });
});
