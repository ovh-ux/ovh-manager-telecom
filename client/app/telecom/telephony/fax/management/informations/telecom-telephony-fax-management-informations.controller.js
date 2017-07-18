angular.module("managerApp").controller("TelecomTelephonyFaxManagementInformationsCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast, NumberPlans) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.group = null;
    self.fax = null;
    self.plan = null;

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            self.fax = self.group.getFax($stateParams.serviceName);
            self.plan = NumberPlans.getPlanByNumber(self.fax);
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_fax_loading_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
