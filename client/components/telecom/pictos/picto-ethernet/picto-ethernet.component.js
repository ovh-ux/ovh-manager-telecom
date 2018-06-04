angular.module('managerApp').component('pictoEthernet', {
  templateUrl: 'components/telecom/pictos/picto-ethernet/picto-ethernet.html',
  bindings: {
    strokeColor: '<strokeColor',
    fillColor: '<fillColor',
  },
  controllerAs: 'PictoEthernet',
});
