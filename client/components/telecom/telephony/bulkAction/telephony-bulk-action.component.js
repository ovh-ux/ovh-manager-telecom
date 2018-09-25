(function () {
  angular.module('managerApp').run(($translate, asyncLoader) => {
    asyncLoader.addTranslations(
      import(`./translations/Messages_${$translate.use()}.xml`)
        .catch(() => import(`./translations/Messages_${$translate.fallbackLanguage()}.xml`))
        .then(x => x.default),
    );
    $translate.refresh();
  });
  angular.module('managerApp').component('telephonyBulkAction', {
    bindings: {
      serviceType: '@',
      billingAccount: '@',
      serviceName: '@',
      customClass: '@?',
      ngDisabled: '=?',
      bulkInfos: '<',
      getBulkParams: '&',
      onOpen: '&?',
      onSuccess: '&?',
      onError: '&?',
      filterServices: '&?',
    },
    templateUrl: 'components/telecom/telephony/bulkAction/telephony-bulk-action.html',
    controller: 'telephonyBulkActionCtrl',
  });
}());
