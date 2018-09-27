angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.special', {
    url: '/special',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/special/telecom-telephony-alias-special.html',
      },
    },
    translations: ['.'],
  });
});
