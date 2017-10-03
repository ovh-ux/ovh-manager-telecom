angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationSchedulerOldPabxCtrl", function ($q, $translate, $stateParams, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.group = null;
    self.number = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            self.number = self.group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                return $q.all({
                    scheduler: self.number.feature.getScheduler(),
                    timeCondition: self.number.feature.getTimeCondition()
                });
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_scheduler_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
