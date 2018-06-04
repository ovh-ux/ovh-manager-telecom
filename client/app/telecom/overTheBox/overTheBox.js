angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.overTheBox', {
    url: '/overTheBox/:serviceName',
    abstract: true,
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/overTheBox/overTheBox.html',
        controller: 'OverTheBoxCtrl',
        controllerAs: 'OverTheBox',
      },
    },
    translations: [
      'common',
      'telecom/overTheBox/details',
      'telecom/overTheBox/warning',
      'telecom/overTheBox/remote',
    ],
    resolve: {
      $title(translations, $translate, $stateParams, OvhApiOverTheBox) {
        return OvhApiOverTheBox.v6().get({
          serviceName: $stateParams.serviceName,
        }).$promise.then(data => $translate.instant('overTheBox_page_title', { name: data.customerDescription || $stateParams.serviceName }, null, null, 'escape')).catch(() => $translate('overTheBox_page_title', { name: $stateParams.serviceName }));
      },
    },
  });
});
