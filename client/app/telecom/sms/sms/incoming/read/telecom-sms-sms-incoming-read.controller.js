angular.module("managerApp").controller("TelecomSmsSmsIncomingReadCtrl", function ($uibModalInstance, incomingSms) {
    "use strict";

    var self = this;

    self.incomingSms = angular.copy(incomingSms);

    self.close = function () {
        return $uibModalInstance.close(true);
    };
});
