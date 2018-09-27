import overTheBoxWarningNotActivated from '../warning/overTheBox-warning-notActivated.html';

angular.module('managerApp').run(($templateCache) => {
  // import templates required by ng-include
  $templateCache.put('app/telecom/overTheBox/warning/overTheBox-warning-notActivated.html', overTheBoxWarningNotActivated);
});
angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.overTheBox.details', {
    url: '/details',
    views: {
      'otbView@telecom.overTheBox': {
        templateUrl: 'app/telecom/overTheBox/details/overTheBox-details.html',
        controller: 'OverTheBoxDetailsCtrl',
        controllerAs: 'OverTheBoxDetails',
      },
    },
    translations: ['.', '../warning', '../remote'],
  });
});
