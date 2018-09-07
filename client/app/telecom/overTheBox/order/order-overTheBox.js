angular.module('managerApp').run(($templateCache) => {
    // import templates required by ng-include
    $templateCache.put("app/telecom/overTheBox/warning/overTheBox-warning-noPaymentMeans.html", require("../warning/overTheBox-warning-noPaymentMeans.html"));
    $templateCache.put("app/telecom/overTheBox/warning/overTheBox-warning-notFound.html", require("../warning/overTheBox-warning-notFound.html"));
    $templateCache.put("app/telecom/overTheBox/warning/overTheBox-warning-noSubscription.html", require("../warning/overTheBox-warning-noSubscription.html"));
    $templateCache.put("app/telecom/overTheBox/warning/overTheBox-warning-deviceToLink.html", require("../warning/overTheBox-warning-deviceToLink.html"));
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
      'telecom/overTheBox/order',
    ],
  });
});
