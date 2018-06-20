angular.module('managerApp').component('pictoFax', {
  templateUrl: 'components/telecom/pictos/picto-fax/picto-fax.html',
  bindings: {
    strokeColor: '<strokeColor',
    fillColor: '<fillColor',
  },
  controllerAs: 'PictoFax',
});
