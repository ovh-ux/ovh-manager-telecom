angular.module('managerApp').config(($stateProvider) => {
  $stateProvider.state('telecom.pack', {
    url: '/pack/:packName',
    views: {
      'telecomView@telecom': {
        templateUrl: 'app/telecom/pack/pack-main.view.html',
      },
      'packView@telecom.pack': {
        templateUrl: 'app/telecom/pack/pack.html',
        controller: 'PackCtrl',
        controllerAs: 'Pack',
      },
    },
    resolve: {
      resiliationNotification() {
        return {};
      },
      $title(translations, $translate, OvhApiPackXdsl, $stateParams) {
        return OvhApiPackXdsl.v6().get({
          packId: $stateParams.packName,
        }).$promise.then(data => $translate.instant('pack_xdsl_page_title', { name: data.description || $stateParams.packName }, null, null, 'escape')).catch(() => $translate('pack_xdsl_page_title', { name: $stateParams.packName }));
      },
    },
    translations: ['common', 'telecom/pack', 'telecom/task'],
  });
});
