(function () {
  angular.module('managerApp').component('telephonyNumberOvhPabx', {
    templateUrl: 'components/telecom/telephony/group/number/feature/ovhPabx/telephony-group-number-feature-ovh-pabx.html',
    require: {
      numberCtrl: '^^telephonyNumber',
    },
    controller: 'TelephonyNumberOvhPabxCtrl',
  });
}());
