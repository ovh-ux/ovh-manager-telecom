(function () {
  angular.module('managerApp').run(($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });
  angular.module('managerApp').component('shippingModeSelection', {
    bindings: {
      selectedMode: '=ngModel',
      selectedRelay: '=?shippingModeSelectionRelay',
      options: '=?shippingModeSelectionOptions',
    },
    templateUrl: 'components/shippingModeSelection/shipping-mode-selection.html',
    controller: 'shippingModeSelectionCtrl',
  });
}());
