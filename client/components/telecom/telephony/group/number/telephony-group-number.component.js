(function () {
  angular.module('managerApp').component('telephonyNumber', {
    templateUrl: 'components/telecom/telephony/group/number/telephony-group-number.html',
    bindings: {
      number: '=telephonyNumber',
      featureActions: '=telephonyNumberFeatureActions',
    },
    controller: 'TelephonyNumberCtrl',
  });
}());
