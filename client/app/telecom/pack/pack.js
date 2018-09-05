angular.module('managerApp').run(($templateCache) => {
    // import templates required by ng-include
    $templateCache.put("app/telecom/pack/slots/voipLine/pack-voipLine.html", require("./slots/voipLine/pack-voipLine.html"));
    $templateCache.put("app/telecom/pack/slots/task/pack-task.html", require("./slots/task/pack-task.html"));
    $templateCache.put("app/telecom/pack/slots/voipEcoFax/pack-voipEcoFax.html", require("./slots/voipEcoFax/pack-voipEcoFax.html"));
    $templateCache.put("app/telecom/pack/slots/hubic/pack-hubic.html", require("./slots/hubic/pack-hubic.html"));
    $templateCache.put("app/telecom/pack/slots/exchangeAccount/pack-exchangeAccount.html", require("./slots/exchangeAccount/pack-exchangeAccount.html"));
    $templateCache.put("app/telecom/pack/slots/xdslAccess/pack-xdslAccess.html", require("./slots/xdslAccess/pack-xdslAccess.html"));
    $templateCache.put("app/telecom/pack/slots/informations/pack-informations.html", require("./slots/informations/pack-informations.html"));
    $templateCache.put("app/telecom/pack/slots/promotionCode/pack-promotionCode.html", require("./slots/promotionCode/pack-promotionCode.html"));
    $templateCache.put("app/telecom/pack/slots/domain/pack-domain.html", require("./slots/domain/pack-domain.html"));
});
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
        }).$promise
          .then(data => $translate.instant('pack_xdsl_page_title', { name: data.description || $stateParams.packName }, null, null, 'escape'))
          .catch(() => $translate.instant('pack_xdsl_page_title', { name: $stateParams.packName }));
      },
    },
    translations: ['common', 'telecom/pack', 'telecom/task', 'telecom/pack/slots/emailPro'],
  });
});
