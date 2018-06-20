(function () {
  angular.module('managerApp').component('telephonyNumberConference', {
    templateUrl: 'components/telecom/telephony/group/number/feature/conference/telephony-group-number-feature-conference.html',
    require: {
      numberCtrl: '^telephonyNumber',
    },
    controller: 'TelephonyNumberConferenceCtrl',
  });
}());
