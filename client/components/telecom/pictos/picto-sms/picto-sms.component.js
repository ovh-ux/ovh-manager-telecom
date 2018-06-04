angular.module('managerApp').component('pictoSms', {
  templateUrl: 'components/telecom/pictos/picto-sms/picto-sms.html',
  bindings: {
    strokeColor: '<strokeColor',
    fillColor: '<fillColor',
  },
  controllerAs: 'PictoSms',
});
