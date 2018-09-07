(function () {
  angular.module('managerApp').run(($translate, asyncLoader) => {
    asyncLoader.addTranslations(import(`./translations/Messages_${$translate.use()}.xml`).then(x => x.default));
    $translate.refresh();
  });
  angular.module('managerApp').component('telephonyNumber', {
    templateUrl: 'components/telecom/telephony/group/number/telephony-group-number.html',
    bindings: {
      number: '=telephonyNumber',
      featureActions: '=telephonyNumberFeatureActions',
    },
    controller: 'TelephonyNumberCtrl',
  });
}());
