angular.module('managerApp').component('pictoPhone', {
  templateUrl: 'components/telecom/pictos/picto-phone/picto-phone.html',
  bindings: {
    strokeColor: '<strokeColor',
    fillColor: '<fillColor',
  },
  controllerAs: 'PictoPhone',
});
