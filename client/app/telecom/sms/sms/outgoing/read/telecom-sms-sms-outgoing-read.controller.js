angular.module("managerApp").controller("TelecomSmsSmsOutgoingReadCtrl", function ($uibModalInstance, outgoingSms, outgoingSmsHlr) {
    "use strict";

    var self = this;

    self.outgoingSms = angular.copy(outgoingSms);
    self.outgoingSmsHlr = angular.copy(outgoingSmsHlr);

    self.close = function () {
        return $uibModalInstance.close(true);
    };
});
