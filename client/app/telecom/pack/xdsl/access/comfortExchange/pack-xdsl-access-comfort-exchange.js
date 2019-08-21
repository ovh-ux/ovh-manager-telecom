angular.module('managerApp')
  .config(($stateProvider) => {
    $stateProvider
      .state('telecom.pack.xdsl.access-modem-exchange', {
        url: '/comfortExchange',
        views: {
          'accessView@telecom.pack.xdsl': {
            component: 'xdslAccessComfortExchange',
          },
        },
        resolve: {
          xdslId: /* @ngInject */ $transition$ => $transition$.params().serviceName,
        },
        translations: { value: ['..', '.'], format: 'json' },
      });
  });
