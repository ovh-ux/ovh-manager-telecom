angular.module("managerApp").controller("TelecomTelephonyLineDetailsCtrl", function ($q, $stateParams, TelephonyMediator, NumberPlans) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };
    self.lastRegistration = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;
            self.line = self.group.getLine($stateParams.serviceName);
            self.plan = NumberPlans.getPlanByNumber(self.line);

            return $q.all({
                phone: self.line.getPhone(),
                options: self.line.getOptions(),
                ips: self.line.getIps(),
                lastRegistrations: self.line.getLastRegistrations()
            }).then(function () {
                if (self.line.lastRegistrations && self.line.lastRegistrations.length) {
                    self.lastRegistration = _.last(_.sortBy(self.line.lastRegistrations, function (reg) {
                        return new Date(reg.datetime);
                    }));
                }
            });

        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
