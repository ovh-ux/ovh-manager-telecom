angular.module("managerApp").controller("TelecomSmsReceiversCleanCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, receiver) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        clean: false
    };

    self.cleaned = false;

    self.receiver = angular.copy(receiver);

    self.clean = {
        choice: "freemium",
        price: self.receiver.records * 0.1 //  0.1 credit per receiver
    };

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cleanReceivers = function () {
        self.loading.clean = true;

        return $q.all([
            Sms.Receivers().Lexi().clean({
                serviceName: $stateParams.serviceName,
                slotId: self.receiver.slotId
            }, {
                freemium: self.clean.choice === "freemium",
                priceOnly: false
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function (results) {
            self.loading.clean = false;
            self.cleaned = true;

            return $timeout(self.close({
                taskId: results[0].taskId
            }), 1000);
        }, function (error) {
            return self.cancel({
                type: "API",
                msg: error
            });
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function (task) {
        return $uibModalInstance.close(task || true);
    };

    /* -----  End of ACTIONS  ------*/
});
