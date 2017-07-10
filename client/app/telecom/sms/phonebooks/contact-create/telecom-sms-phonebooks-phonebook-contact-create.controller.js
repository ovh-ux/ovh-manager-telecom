angular.module("managerApp").controller("TelecomSmsPhonebooksPhonebookContactCreateCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, data, Phonebookcontact, Sms, TelephonyMediator) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isValidNumber = function (value) {
        return !_.isEmpty(value) ? TelephonyMediator.IsValidNumber(value) : true;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setGroup = function ($event, group) {
        $event.preventDefault();
        self.phonecontactForm.group = group;
    };

    self.create = function () {
        self.phonecontactForm.isCreating = true;
        return $q.all([
            Sms.Phonebooks().PhonebookContact().Lexi().create({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebook, "bookKey")
            }, Phonebookcontact.getContactData(self.phonecontactForm)).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.phonecontactForm.isCreating = false;
            self.phonecontactForm.hasBeenCreated = true;
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

    /*= ==============================
    =            EVENTS            =
    ===============================*/

    self.handleContactPhoneNumber = function () {
        return Phonebookcontact.hasAtLeastOnePhoneNumber(self.phonecontactForm);
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebook = angular.copy(data.phonebook);
        self.groupsAvailable = angular.copy(data.groupsAvailable);
        self.phonecontactForm = {
            surname: null,
            name: null,
            group: null,
            homePhone: null,
            homeMobile: null,
            workPhone: null,
            workMobile: null,
            isCreating: false,
            hasBeenCreated: false
        };
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
