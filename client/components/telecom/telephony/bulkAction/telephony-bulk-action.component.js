(function () {
    "use strict";

    angular.module("managerApp").component("telephonyBulkAction", {
        bindings: {
            serviceType: "@",
            billingAccount: "@",
            serviceName: "@",
            customClass: "@?",
            ngDisabled: "=?",
            bulkInfos: "<",
            getBulkParams: "&",
            onOpen: "&?",
            onSuccess: "&?",
            onError: "&?",
            filterServices: "&?",
            filterServicesAsync: "&?"
        },
        templateUrl: "components/telecom/telephony/bulkAction/telephony-bulk-action.html",
        controller: "telephonyBulkActionCtrl"
    });

})();
