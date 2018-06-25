(function () {
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
