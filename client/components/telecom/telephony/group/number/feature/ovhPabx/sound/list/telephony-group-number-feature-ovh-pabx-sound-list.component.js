(function () {
  angular.module('managerApp').component('telephonyNumberOvhPabxSoundList', {
    templateUrl: 'components/telecom/telephony/group/number/feature/ovhPabx/sound/list/telephony-group-number-feature-ovh-pabx-sound-list.html',
    require: {
      numberCtrl: '^^?telephonyNumber',
      ovhPabxCtrl: '^^?telephonyNumberOvhPabx',
    },
    bindings: {
      ovhPabx: '=?ovhPabx',
      selectedSound: '=?ngModel',
      withChoice: '<?',
      onSoundSelected: '&?',
    },
    controller: 'telephonyNumberOvhPabxSoundListCtrl',
  });
}());
