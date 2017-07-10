angular.module("managerApp").controller("TelecomSmsSmsComposeAddPhonebookContactCtrl", function ($filter, $q, $scope, $stateParams, $timeout, $translate, $uibModalInstance,
                                                                                                 phonebooks, Sms, Toast, SMS_PHONEBOOKS) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchPhonebookContact (phonebook) {
        return Sms.Phonebooks().PhonebookContact().Lexi().query({
            serviceName: $stateParams.serviceName,
            bookKey: _.get(phonebook, "bookKey")
        }).$promise.then(function (phonebookContactIds) {
            return $q.all(_.map(_.chunk(phonebookContactIds, 50), function (chunkIds) {
                return Sms.Phonebooks().PhonebookContact().Lexi().getBatch({
                    serviceName: $stateParams.serviceName,
                    bookKey: _.get(phonebook, "bookKey"),
                    id: chunkIds
                }).$promise;
            })).then(function (chunkResult) {
                var result = _.pluck(_.flatten(chunkResult), "value");
                var emptyPhoneNumber = _.get(SMS_PHONEBOOKS, "emptyFields.numbers");
                return _.each(result, function (contact) {
                    contact.homeMobile = contact.homeMobile === emptyPhoneNumber ? "" : contact.homeMobile;
                    contact.homePhone = contact.homePhone === emptyPhoneNumber ? "" : contact.homePhone;
                    contact.workMobile = contact.workMobile === emptyPhoneNumber ? "" : contact.workMobile;
                    contact.workPhone = contact.workPhone === emptyPhoneNumber ? "" : contact.workPhone;
                });
            }).then(function (contacts) {
                var clonedContacts = [];
                _.each(self.availableTypes, function (field) {
                    _.each(_.cloneDeep(contacts), function (contact) {
                        contact.type = field;
                        contact.id = [contact.id, contact.type].join("_");
                        if (_.isEmpty(_.get(contact, field))) {
                            return;
                        }
                        clonedContacts.push(_.omit(contact, _.difference(self.availableTypes, [field])));
                    });
                });
                return _.flatten(clonedContacts);
            });
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.add = function () {
        self.phonebookContact.isAdding = true;
        return $timeout(angular.noop, 500).then(function () {
            self.phonebookContact.isAdding = false;
            self.phonebookContact.hasBeenAdded = true;
            return $timeout(angular.noop, 1500).then(function () {
                return self.close(self.selectedContacts);
            });
        });
    };

    self.sortPhonebookContact = function () {
        var data = angular.copy(self.phonebookContact.raw);
        data = $filter("orderBy")(
            data,
            self.phonebookContact.orderBy,
            self.phonebookContact.orderDesc
        );
        self.phonebookContact.sorted = _.each(data, function (contact) {
            contact.isSelected = _.some(self.selectedContacts, { id: contact.id });
        });
    };

    self.refresh = function () {
        self.phonebookContact.isLoading = true;
        Sms.Phonebooks().PhonebookContact().Lexi().resetAllCache();
        return fetchPhonebookContact(self.phonebooks.current).then(function (phonebookContact) {
            self.phonebookContact.raw = phonebookContact;
            self.sortPhonebookContact();
        }).catch(function (err) {
            Toast.error([$translate.instant("sms_sms_compose_add_phonebook_contact_ko"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.phonebookContact.isLoading = false;
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(self.selectedContacts);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebooks = phonebooks;
        self.phonebookContact = {
            raw: [],
            sorted: null,
            selected: {},
            orderBy: "surname",
            orderDesc: false,
            isLoading: false,
            isAdding: false,
            hasBeenAdded: false
        };
        self.selectedContacts = angular.copy(self.phonebooks.lists);
        self.availableTypes = _.get(SMS_PHONEBOOKS, "numberFields");
        $scope.$watch("AddPhonebookContactCtrl.phonebookContact.sorted", function (contacts) {
            _.each(contacts, function (contact) {
                var alreadyAdded = _.find(self.selectedContacts, { id: contact.id });
                if (contact.isSelected) {
                    if (!alreadyAdded) {
                        self.selectedContacts.push(contact);
                    }
                } else {
                    _.pull(self.selectedContacts, alreadyAdded);
                }
            });
        }, true);
        return self.refresh();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
