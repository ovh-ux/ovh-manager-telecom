(function () {
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
