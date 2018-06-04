(function () {
  angular.module('managerApp').component('telephonyNumberOvhPabxTtsCreate', {
    templateUrl: 'components/telecom/telephony/group/number/feature/ovhPabx/tts/create/telephony-group-number-feature-ovh-pabx-tts-create.html',
    require: {
      numberCtrl: '^^?telephonyNumber',
      ovhPabxCtrl: '^^?telephonyNumberOvhPabx',
    },
    bindings: {
      ovhPabx: '=?ovhPabx',
      onTtsCreationCancel: '&?',
      onTtsCreationSuccess: '&?',
    },
    controller: 'telephonyNumberOvhPabxTtsCreateCtrl',
  });
}());
