angular.module("managerApp").controller("TelecomSmsPhonebooksCtrl", function ($document, $filter, $q, $scope, $stateParams, $translate, $timeout,
                                                                              $uibModal, $window, Sms, Toast, ToastError, SMS_PHONEBOOKS) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function fetchPhonebooks () {
        return Sms.Phonebooks().Lexi().query({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (phonebooksIds) {
            return $q.all(_.map(phonebooksIds, function (bookKey) {
                return Sms.Phonebooks().Lexi().get({
                    serviceName: $stateParams.serviceName,
                    bookKey: bookKey
                }).$promise;
            })).then(function (phonebooks) {
                return _.sortBy(phonebooks, "name");
            });
        });
    }

    function fetchPhonebookContact (phonebook) {
        if (!_.size(phonebook)) {
            return $q.when([]);
        }
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
                var emptyGroup = _.get(SMS_PHONEBOOKS, "emptyFields.group");
                var emptyPhoneNumber = _.get(SMS_PHONEBOOKS, "emptyFields.numbers");
                return _.each(result, function (contact) {
                    contact.group = contact.group === emptyGroup ? "" : contact.group;
                    contact.homeMobile = contact.homeMobile === emptyPhoneNumber ? "" : contact.homeMobile;
                    contact.homePhone = contact.homePhone === emptyPhoneNumber ? "" : contact.homePhone;
                    contact.workMobile = contact.workMobile === emptyPhoneNumber ? "" : contact.workMobile;
                    contact.workPhone = contact.workPhone === emptyPhoneNumber ? "" : contact.workPhone;
                });
            });
        });
    }

    self.getSelection = function () {
        return _.filter(self.phonebookContact.raw, function (contact) {
            return contact && self.phonebookContact.selected && self.phonebookContact.selected[contact.id];
        });
    };

    function resetAllCache () {
        Sms.Phonebooks().Lexi().resetAllCache();
        Sms.Phonebooks().PhonebookContact().Lexi().resetAllCache();
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    /* ----------  Phonebook  ----------*/

    self.startEdition = function () {
        self.phonebooks.current.inEdition = true;
        self.phonebooks.current.newName = angular.copy(self.phonebooks.current.name);
        $timeout(function () {
            $document.find("input[name='phonebookName']").select();
        });
    };

    self.cancelEdition = function () {
        self.phonebooks.current.inEdition = false;
    };

    self.updatePhonebook = function () {
        return Sms.Phonebooks().Lexi().update({
            serviceName: $stateParams.serviceName,
            bookKey: _.get(self.phonebooks.current, "bookKey")
        }, {
            name: self.phonebooks.current.newName
        }).$promise.then(function () {
            Sms.Phonebooks().Lexi().resetAllCache();
            return fetchPhonebooks().then(function (phonebooks) {
                self.phonebooks.raw = phonebooks;
                self.phonebooks.current = _.find(self.phonebooks.raw, {
                    name: self.phonebooks.current.newName
                });
                return phonebooks;
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("sms_phonebooks_phonebook_update_ko"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.phonebooks.current.inEdition = false;
        });
    };

    self.deletePhonebook = function () {
        self.phonebooks.hasModalOpened = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/phonebooks/delete/telecom-sms-phonebooks-delete.html",
            controller: "TelecomSmsPhonebooksDeleteCtrl",
            controllerAs: "DeleteCtrl",
            resolve: {
                phonebook: function () { return self.phonebooks.current; }
            }
        });
        modal.result.then(function () {
            Sms.Phonebooks().Lexi().resetAllCache();
            return fetchPhonebooks().then(function (phonebooks) {
                self.phonebooks.raw = phonebooks;
                self.phonebooks.current = _.isEmpty(self.phonebooks.raw) ? {} : _.head(self.phonebooks.raw);
                return self.refresh();
            });
        }).catch(function (err) {
            if (err && err.type === "API") {
                Toast.error($translate.instant("sms_phonebooks_phonebook_delete_ko", { error: _.get(err, "msg.data.message") }));
            }
        }).finally(function () {
            self.phonebooks.hasModalOpened = false;
        });
        return modal;
    };

    /* ----------  Phonebook contact  ----------*/

    self.createPhonebookContact = function () {
        self.phonebooks.hasModalOpened = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/phonebooks/contact-create/telecom-sms-phonebooks-phonebook-contact-create.html",
            controller: "TelecomSmsPhonebooksPhonebookContactCreateCtrl",
            controllerAs: "ContactCreateCtrl",
            resolve: {
                data: function () {
                    return {
                        phonebook: self.phonebooks.current,
                        groupsAvailable: self.phonebookContact.groupsAvailable
                    };
                }
            }
        });
        modal.result.then(function () {
            return self.refresh();
        }).catch(function (err) {
            if (err && err.type === "API") {
                Toast.error($translate.instant("sms_phonebooks_phonebook_contact_create_ko", { error: _.get(err, "msg.data.message") }));
            }
        }).finally(function () {
            self.phonebooks.hasModalOpened = false;
        });
        return modal;
    };

    self.updatePhonebookContact = function (contact) {
        self.phonebooks.hasModalOpened = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/phonebooks/contact-update/telecom-sms-phonebooks-phonebook-contact-update.html",
            controller: "TelecomSmsPhonebooksPhonebookContactUpdateCtrl",
            controllerAs: "ContactUpdateCtrl",
            resolve: {
                data: function () {
                    return {
                        phonebook: self.phonebooks.current,
                        groupsAvailable: self.phonebookContact.groupsAvailable,
                        contact: contact
                    };
                }
            }
        });
        modal.result.then(function () {
            return self.refresh();
        }).catch(function (err) {
            if (err && err.type === "API") {
                Toast.error($translate.instant("sms_phonebooks_phonebook_contact_update_ko", { error: _.get(err, "msg.data.message") }));
            }
        }).finally(function () {
            self.phonebooks.hasModalOpened = false;
        });
        return modal;
    };

    self.deletePhonebookContact = function (contact) {
        self.phonebooks.hasModalOpened = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/phonebooks/contact-delete/telecom-sms-phonebooks-phonebook-contact-delete.html",
            controller: "TelecomSmsPhonebooksPhonebookContactDeleteCtrl",
            controllerAs: "ContactDeleteCtrl",
            resolve: {
                data: function () {
                    return {
                        phonebook: self.phonebooks.current,
                        contact: contact
                    };
                }
            }
        });
        modal.result.then(function () {
            return self.refresh();
        }).catch(function (err) {
            if (err && err.type === "API") {
                Toast.error($translate.instant("sms_phonebooks_phonebook_contact_delete_ko", { error: _.get(err, "msg.data.message") }));
            }
        }).finally(function () {
            self.phonebooks.hasModalOpened = false;
        });
        return modal;
    };

    self.deleteSelectedPhonebookContact = function () {
        var contacts = self.getSelection();
        var queries = contacts.map(function (contact) {
            return Sms.Phonebooks().PhonebookContact().Lexi().delete({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebooks.current, "bookKey"),
                id: contact.id
            }).$promise;
        });
        self.phonebookContact.isDeleting = true;
        queries.push($timeout(angular.noop, 500)); // avoid clipping
        Toast.info($translate.instant("sms_phonebooks_phonebook_contact_selected_delete_info"));
        return $q.all(queries).then(function () {
            self.phonebookContact.selected = {};
            return self.refresh();
        }).catch(function (err) {
            Toast.error($translate.instant("sms_phonebooks_phonebook_contact_selected_delete_ko", { error: _.get(err, "data.message") }));
            return $q.reject(err);
        }).finally(function () {
            self.phonebookContact.isDeleting = false;
        });
    };

    self.importPhonebookContact = function () {
        self.phonebooks.hasModalOpened = true;
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/sms/phonebooks/contact-import/telecom-sms-phonebooks-phonebook-contact-import.html",
            controller: "TelecomSmsPhonebooksPhonebookContactImportCtrl",
            controllerAs: "ContactImportCtrl",
            resolve: {
                phonebook: function () { return self.phonebooks.current; }
            }
        });
        modal.result.then(function (response) {
            if (_.has(response, "taskId")) {
                self.phonebookContact.isImporting = true;
                return Sms.Task().Lexi().poll($scope, {
                    serviceName: $stateParams.serviceName,
                    taskId: response.taskId
                }).finally(function () {
                    self.phonebookContact.isImporting = false;
                    return self.refresh();
                });
            }
            return response;
        }).catch(function (err) {
            if (err && err.type === "API") {
                Toast.error($translate.instant("sms_phonebooks_phonebook_contact_import_ko", { error: _.get(err, "msg.data.message") }));
            }
        }).finally(function () {
            self.phonebooks.hasModalOpened = false;
        });
        return modal;
    };

    self.exportPhonebookContact = function () {
        self.phonebookContact.isExporting = true;
        var tryGetCsvExport = function () {
            return Sms.Phonebooks().Lexi().getExport({
                serviceName: $stateParams.serviceName,
                bookKey: _.get(self.phonebooks.current, "bookKey"),
                format: "csv"
            }).$promise.then(function (exportPhonebook) {
                if (exportPhonebook.status === "done") {
                    return exportPhonebook;
                }
                self.phonebookContact.poller = $timeout(tryGetCsvExport, 1000);
                return self.phonebookContact.poller;

            });
        };
        return tryGetCsvExport().then(function (phonebook) {
            $window.location.href = phonebook.url;
            Toast.success($translate.instant("sms_phonebooks_phonebook_contact_export_ok"));
        }).catch(function (err) {
            Toast.error([$translate.instant("sms_phonebooks_phonebook_contact_export_ko"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.phonebookContact.isExporting = false;
        });
    };

    self.updatePhonebookContactGroups = function () {
        self.phonebookContact.groupsAvailable = _.chain(self.phonebookContact.raw)
            .pluck("group")
            .pull(_.get(SMS_PHONEBOOKS, "emptyFields.group"))
            .uniq()
            .compact()
            .value();
    };

    self.sortPhonebookContact = function () {
        var data = angular.copy(self.phonebookContact.raw);
        data = $filter("orderBy")(
            data,
            self.phonebookContact.orderBy,
            self.phonebookContact.orderDesc
        );
        self.phonebookContact.sorted = data;

        // avoid pagination bug…
        if (_.size(self.phonebookContact.sorted) === 0) {
            self.phonebookContact.paginated = [];
        }
    };

    self.orderPhonebookContactBy = function (by) {
        if (self.phonebookContact.orderBy === by) {
            self.phonebookContact.orderDesc = !self.phonebookContact.orderDesc;
        } else {
            self.phonebookContact.orderBy = by;
        }
        self.sortPhonebookContact();
    };

    /* ----------  Refresh  ----------*/

    self.refresh = function () {
        self.phonebookContact.isLoading = true;
        Sms.Phonebooks().PhonebookContact().Lexi().resetAllCache();
        return fetchPhonebookContact(self.phonebooks.current).then(function (phonebookContact) {
            self.phonebookContact.raw = angular.copy(phonebookContact);
            self.sortPhonebookContact();
            self.updatePhonebookContactGroups();
        }).catch(function (err) {
            Toast.error([$translate.instant("sms_phonebooks_phonebook_contact_ko"), (err.data && err.data.message) || ""].join(" "));
            return $q.reject(err);
        }).finally(function () {
            self.phonebookContact.isLoading = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= ==============================
    =            EVENTS            =
    ===============================*/

    self.changePhonebook = function () {
        return self.refresh();
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebooks = {
            raw: [],
            current: {},
            isLoading: false,
            hasModalOpened: false
        };
        self.phonebookContact = {
            raw: [],
            groupsAvailable: [],
            paginated: null,
            sorted: null,
            selected: {},
            orderBy: "surname",
            orderDesc: false,
            isLoading: false,
            isImporting: false,
            isExporting: false,
            isDeleting: false,
            poller: null
        };
        resetAllCache();
        self.phonebooks.isLoading = true;
        return fetchPhonebooks().then(function (phonebooks) {
            self.phonebooks.raw = phonebooks;
            self.phonebooks.current = _.find(self.phonebooks.raw, {
                bookKey: $stateParams.bookKey
            }) || _.head(self.phonebooks.raw);
            self.phonebookContact.isLoading = true;
            return fetchPhonebookContact(self.phonebooks.current).then(function (phonebookContact) {
                self.phonebookContact.raw = angular.copy(phonebookContact);
                self.sortPhonebookContact();
                self.updatePhonebookContactGroups();
            }).finally(function () {
                self.phonebookContact.isLoading = false;
            });
        }).catch(function (err) {
            Toast.error([$translate.instant("sms_phonebooks_phonebook_ko"), (err.data && err.data.message) || ""].join(" "));
            return $q.rejec(err);
        }).finally(function () {
            self.phonebooks.isLoading = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

    $scope.$on("$destroy", function () {
        $timeout.cancel(self.phonebookContact.poller);
    });
});
