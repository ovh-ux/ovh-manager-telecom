angular.module("managerApp").controller("TelecomTelephonyLineTerminateCtrl", function ($stateParams, $state, TelephonyMediator, Toast, $translate) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        terminate: false
    };

    self.availableReasons = [];
    self.reason = {
        id: ""
    };
    self.hasPhone = false;

    self.terminate = function () {
        self.loading.terminate = true;

        return self.line.terminate(self.reason).then(function () {
            $state.go(".cancel").then(() => Toast.success($translate.instant("telephony_group_line_terminating_ok")));
        }).catch(function (error) {
            Toast.error($translate.instant("telephony_group_line_terminating_ko", { error: error.data.message }));
        }).finally(function () {
            self.reason = {
                id: ""
            };
            self.loading.terminate = false;

        });
    };

    self.haveToGiveReasonDetail = function () {
        return [
            "missingOptions",
            "other"
        ].indexOf(self.reason.id) !== -1;
    };

    self.cleanReasonDetail = function () {
        if (!self.haveToGiveReasonDetail()) {
            delete self.reason.details;
        }
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.line = group.getLine($stateParams.serviceName);
            return self.line.getPhone().then(function (phone) {
                self.hasPhone = !!(phone && phone.brand);
                return self.hasPhone;
            }, function () {
                self.hasPhone = false;
                return self.hasPhone;
            });
        }).then(function () {
            return TelephonyMediator.getApiScheme().then(function (schema) {
                self.availableReasons = schema.models["telephony.TerminationReasonEnum"].enum;
                return self.availableReasons;
            });
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
