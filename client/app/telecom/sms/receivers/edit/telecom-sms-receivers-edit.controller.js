angular.module("managerApp").controller("TelecomSmsReceiversEditCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, receiver) {
    "use strict";

    var self = this;

    self.loading = {
        editReceiver: false
    };

    self.edited = false;

    self.receiver = angular.copy(receiver);

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return !(
            self.receiver.autoUpdate === receiver.autoUpdate &&
            self.receiver.description === receiver.description
        );
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.edit = function () {
        self.loading.editReceiver = true;

        return $q.all([
            Sms.Receivers().Lexi().edit({
                serviceName: $stateParams.serviceName,
                slotId: self.receiver.slotId
            }, {
                autoUpdate: self.receiver.autoUpdate,
                description: self.receiver.description
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.editReceiver = false;
            self.edited = true;

            return $timeout(self.close, 1000);
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
