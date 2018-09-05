angular.module('managerApp').run(($templateCache) => {
    // import templates required by ng-include
    $templateCache.put("app/telecom/freeFax/information/freeFax-information.html", require("./information/freeFax-information.html"));
    $templateCache.put("app/telecom/freeFax/credit/freeFax-credit.html", require("./credit/freeFax-credit.html"));
    $templateCache.put("app/telecom/freeFax/faxConfiguration/freeFax-faxConfiguration.html", require("./faxConfiguration/freeFax-faxConfiguration.html"));
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
    translations: ['common', 'telecom/freeFax'],
    resolve: {
      $title(translations, $translate, $stateParams) {
        return $translate.instant('freefax_page_title', { name: $stateParams.serviceName }, null, null, 'escape');
      },
    },
  });
});
