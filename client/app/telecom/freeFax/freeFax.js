import freeFaxInformations from './information/freeFax-information.html';
import freeFaxCredit from './credit/freeFax-credit.html';
import freeFaxFaxConfiguration from './faxConfiguration/freeFax-faxConfiguration.html';

angular.module('managerApp').run(($templateCache) => {
  // import templates required by ng-include
  $templateCache.put('app/telecom/freeFax/information/freeFax-information.html', freeFaxInformations);
  $templateCache.put('app/telecom/freeFax/credit/freeFax-credit.html', freeFaxCredit);
  $templateCache.put('app/telecom/freeFax/faxConfiguration/freeFax-faxConfiguration.html', freeFaxFaxConfiguration);
});
angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.freefax', {
    url: '/freefax/:serviceName',
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/freeFax/freeFax.html',
      },
      'faxView@telecom.freefax': {
        templateUrl: 'app/telecom/freeFax/freeFax-main.view.html',
        controller: 'FreeFaxCtrl',
        controllerAs: 'FreeFax',
      },
    },
    translations: ['.'],
    resolve: {
      $title(translations, $translate, $stateParams) {
        return $translate.instant('freefax_page_title', { name: $stateParams.serviceName }, null, null, 'escape');
      },
    },
  });
});
