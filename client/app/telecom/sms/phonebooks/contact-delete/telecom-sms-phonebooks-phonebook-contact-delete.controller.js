angular.module("managerApp").controller("TelecomSmsPhonebooksPhonebookContactDeleteCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, data, Sms) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.getContactName = function () {
        return [
            _.get(self.contact, "surname"),
            _.get(self.contact, "name")
        ].join(" ");
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.delete = function () {
        self.isDeleting = true;
        return $q.all([
            Sms.Phonebooks().PhonebookContact().Lexi().delete({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebook, "bookKey"),
                id: _.get(self.contact, "id")
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
        self.phonebook = angular.copy(data.phonebook);
        self.contact = angular.copy(data.contact);
        self.isDeleting = false;
        self.deleted = false;
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
