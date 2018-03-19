angular.module("managerApp").controller("TelecomTelephonyLineCallsEventsCtrl", function ($q, $translate, $stateParams, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    /*= ====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);

            return $q.all({
                scheduler: self.line.getScheduler(),
                timeCondition: self.line.getTimeCondition()
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_calls_events_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
