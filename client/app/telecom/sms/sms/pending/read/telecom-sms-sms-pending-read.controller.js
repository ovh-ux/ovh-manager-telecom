angular.module("managerApp").controller("TelecomSmsSmsPendingReadCtrl", function ($uibModalInstance, pendingSms) {
    "use strict";

    var self = this;

    self.pendingSms = angular.copy(pendingSms);

    self.close = function () {
        return $uibModalInstance.close(true);
    };
});
