angular.module("managerApp").controller("TelecomSmsSendersEditCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, Sms, sender) {
    "use strict";

    var self = this;

    self.loading = {
        editSender: false
    };

    self.edited = false;

    self.sender = angular.copy(sender);

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasChanged = function () {
        return !(self.sender.description === sender.description && self.sender.status === sender.status);
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.edit = function () {
        self.loading.editSender = true;

        return $q.all([
            Sms.Senders().Lexi().edit({
                serviceName: $stateParams.serviceName,
                sender: self.sender.sender
            }, {
                description: self.sender.description,
                status: self.sender.status
            }).$promise.then(function (voidResponse) {
                return voidResponse;
            }, function (error) {
                return $q.reject(error);
            }),
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.editSender = false;
            self.edited = true;

            sender.description = self.sender.description;
            sender.status = self.sender.status;

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
