angular.module("managerApp").controller("TelecomSmsPhonebooksDeleteCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, phonebook, Sms) {
    "use strict";

    var self = this;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.delete = function () {
        self.isDeleting = true;
        return $q.all([
            Sms.Phonebooks().Lexi().delete({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebook, "bookKey")
            }).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.isDeleting = false;
            self.deleted = true;
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

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebook = angular.copy(phonebook);
        self.isDeleting = false;
        self.deleted = false;
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
