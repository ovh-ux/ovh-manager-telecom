import overTheBoxWarningNoPaymentMeans from '../warning/overTheBox-warning-noPaymentMeans.html';
import overTheBoxWarningNotFound from '../warning/overTheBox-warning-notFound.html';
import overTheBoxWarningNoSubscription from '../warning/overTheBox-warning-noSubscription.html';
import overTheBoxWarningDeviceToLink from '../warning/overTheBox-warning-deviceToLink.html';

angular.module('managerApp').run(($templateCache) => {
  // import templates required by ng-include
  $templateCache.put('app/telecom/overTheBox/warning/overTheBox-warning-noPaymentMeans.html', overTheBoxWarningNoPaymentMeans);
  $templateCache.put('app/telecom/overTheBox/warning/overTheBox-warning-notFound.html', overTheBoxWarningNotFound);
  $templateCache.put('app/telecom/overTheBox/warning/overTheBox-warning-noSubscription.html', overTheBoxWarningNoSubscription);
  $templateCache.put('app/telecom/overTheBox/warning/overTheBox-warning-deviceToLink.html', overTheBoxWarningDeviceToLink);
});
angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.overTheBox-order', {
    url: '/overTheBox/order',
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/overTheBox/order/order-overTheBox.html',
        controller: 'OrderOverTheBoxCtrl',
        controllerAs: 'OrderOverTheBox',
      },
    },
    translations: [
      '.',
      '..',
      '../warning',
    ],
  });
});
