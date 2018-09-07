angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.telephony.linesGroup', {
    url: '/linesGroup',
    views: {
      'groupView@telecom.telephony': {
        templateUrl: 'app/telecom/telephony/billingAccount/administration/linesGroup/telecom-telephony-billing-account-administration-lines-group.html',
        controller: 'TelecomTelephonyBillingAccountAdministrationLinesGroup',
        controllerAs: 'LinesGroupCtrl',
      },
    },
    translations: [
      'telecom/telephony/billingAccount/administration',
      'telecom/telephony/billingAccount/administration/linesGroup'
    ],
  });
});
