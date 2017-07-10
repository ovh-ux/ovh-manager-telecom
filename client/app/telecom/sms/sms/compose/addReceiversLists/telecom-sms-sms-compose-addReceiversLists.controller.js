angular.module("managerApp").controller("TelecomSmsSmsComposeAddReceiversListsCtrl", function ($stateParams, $timeout, $uibModalInstance, Sms, SmsMediator, receivers) {
    "use strict";

    var self = this;

    self.loading = {
        addReceiversLists: false
    };

    self.added = false;

    self.receivers = angular.copy(receivers);

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasSelected = function () {
        return _.filter(self.receivers, { isSelected: true }).length > 0;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.add = function () {
        self.loading.addReceiversLists = true;
        return $timeout(angular.noop, 1000).then(function () {
            self.loading.addReceiversLists = false;
            self.added = true;
            return $timeout(self.close(self.receivers), 3000);
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(self.receivers);
    };

    /* -----  End of ACTIONS  ------*/
});
