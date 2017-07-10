angular.module("managerApp").controller("TelecomSmsSmsOutgoingRemoveCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, outgoingSms) {
    "use strict";

    var self = this;

    self.loading = {
        removeOutgoing: false
    };

    self.removed = false;

    self.outgoingSms = angular.copy(outgoingSms);

    self.remove = function () {
        self.loading.removeOutgoing = true;

        return $q.all([
            Sms.Outgoing().Lexi().delete({
                serviceName: $stateParams.serviceName,
                id: self.outgoingSms.id
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.removeOutgoing = false;
            self.removed = true;

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
});
