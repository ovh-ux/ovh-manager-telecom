angular.module("managerApp").controller("TelecomSmsSendersTerminateCtrl", function ($q, $timeout, $uibModalInstance, Sms, sender) {
    "use strict";

    var self = this;

    self.loading = {
        terminate: false
    };
    self.terminated = false;
    self.sender = angular.copy(sender);
    self.number = _.get(self.sender, "serviceInfos.domain");

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getRenewInfos () {
        return {
            automatic: self.sender.serviceInfos.renew.automatic,
            deleteAtExpiration: !self.sender.serviceInfos.renew.deleteAtExpiration,
            forced: self.sender.serviceInfos.renew.forced,
            period: self.sender.serviceInfos.renew.period
        };
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.terminate = function () {
        self.loading.terminate = true;
        return $q.all([
            Sms.VirtualNumbers().Lexi().updateVirtualNumbersServiceInfos({
                number: self.number
            }, { renew: getRenewInfos() }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.terminate = false;
            self.terminated = true;
            return $timeout(self.close, 1500);
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

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    /* -----  End of ACTIONS  ------*/
});
