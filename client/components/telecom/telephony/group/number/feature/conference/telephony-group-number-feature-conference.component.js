(function () {
  angular.module('managerApp').run(($translate, asyncLoader) => {
    asyncLoader.addTranslations(import(`./translations/Messages_${$translate.use()}.xml`).then(x => x.default));
    $translate.refresh();
  });
  angular.module('managerApp').component('telephonyNumberConference', {
    templateUrl: 'components/telecom/telephony/group/number/feature/conference/telephony-group-number-feature-conference.html',
    require: {
      numberCtrl: '^telephonyNumber',
    },
    controller: 'TelephonyNumberConferenceCtrl',
  });
}());
