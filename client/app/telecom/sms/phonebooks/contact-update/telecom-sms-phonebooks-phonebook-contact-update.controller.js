angular.module("managerApp").controller("TelecomSmsPhonebooksPhonebookContactUpdateCtrl", function ($q, $stateParams, $timeout, $uibModalInstance, data, Phonebookcontact, Sms, TelephonyMediator) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isValidNumber = function (value) {
        return !_.isEmpty(value) ? TelephonyMediator.IsValidNumber(value) : true;
    };

    self.hasChanged = function () {
        var fields = ["surname", "name", "group", "homePhone", "homeMobile", "workPhone", "workMobile"];
        return !_.isEqual(_.pick(self.phonecontactForm, fields), _.pick(data.contact, fields));
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.setGroup = function ($event, group) {
        $event.preventDefault();
        self.phonecontactForm.group = group;
    };

    self.update = function () {
        self.phonecontactForm.isUpdating = true;
        return $q.all([
            Sms.Phonebooks().PhonebookContact().Lexi().update({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebook, "bookKey"),
                id: _.get(self.contact, "id")
            }, Phonebookcontact.getContactData(self.phonecontactForm)).$promise,
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.phonecontactForm.isUpdating = false;
            self.phonecontactForm.hasBeenUpdated = true;
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
        self.contact = angular.copy(data.contact);
        self.phonecontactForm = {
            surname: null,
            name: null,
            group: null,
            homePhone: null,
            homeMobile: null,
            workPhone: null,
            workMobile: null,
            isUpdating: false,
            hasBeenUpdated: false
        };
        _.assign(self.phonecontactForm, self.contact);
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
