angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('telecom.pack.xdsl.access-modem-exchange', {
        url: '/comfortExchange',
        views: {
          'accessView@telecom.pack.xdsl': {
            controller: 'XdslAccessComfortExchangeCtrl',
            controllerAs: '$ctrl',
            templateUrl: 'app/telecom/pack/xdsl/access/comfortExchange/pack-xdsl-access-comfort-exchange.html',
          },
        },
        translations: { value: ['..', '.'], format: 'json' },
      });
  });
