angular.module("managerApp").controller("TelecomSmsSmsComposeTipsCtrl", function ($uibModalInstance) {
    "use strict";

    var self = this;

    self.close = function () {
        return $uibModalInstance.close(true);
    };
});
