angular.module("managerApp").controller("TelecomSmsPhonebooksCreateCtrl", function ($state, $stateParams, Sms, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.create = function () {
        self.phonebookToAdd.isAdding = true;
        return Sms.Phonebooks().Lexi().create({
            serviceName: $stateParams.serviceName
        }, _.pick(self.phonebookToAdd, "name")).$promise.then(function (phonebook) {
            return $state.go("telecom.sms.phonebooks", {
                bookKey: phonebook.bookKey
            });
        }).catch(function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.phonebookToAdd.isAdding = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebookToAdd = {
            name: null,
            isAdding: false
        };
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
