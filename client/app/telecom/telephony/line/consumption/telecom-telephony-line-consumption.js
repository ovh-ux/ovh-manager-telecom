angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.line.consumption', {
    url: '/consumption',
    views: {
      'lineInnerView@telecom.telephony.line': {
        templateUrl: 'app/telecom/telephony/line/consumption/telecom-telephony-line-consumption.html',
        controller: 'TelecomTelephonyLineConsumptionCtrl',
        controllerAs: 'LineConsumptionCtrl',
      },
    },
    translations: [
      'telecom/telephony/line/consumption',
      'telecom/telephony/service/consumption',
      'telecom/telephony/service/consumption/incomingCalls',
      'telecom/telephony/service/consumption/outgoingCalls',
      'telecom/telephony/service/consumption/incomingFax',
      'telecom/telephony/service/consumption/outgoingFax',
    ],
  });
});
