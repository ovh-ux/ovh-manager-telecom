angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.alias.consumption', {
    url: '/consumption',
    views: {
      'aliasInnerView@telecom.telephony.alias': {
        templateUrl: 'app/telecom/telephony/alias/consumption/telecom-telephony-alias-consumption.html',
        controller: 'TelecomTelephonyAliasConsumptionCtrl',
        controllerAs: 'AliasConsumptionCtrl',
      },
    },
    translations: ['.', '../../service/consumption'],
  });
});
