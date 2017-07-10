angular.module("managerApp").controller("TelecomSmsPhonebooksPhonebookContactImportCtrl", function ($q, $stateParams, $timeout, $translate, $uibModalInstance, phonebook, Sms, User, ToastError) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.checkValidTextExtention = function (file) {
        var validExtensions = ["csv", "xls", "xlsx"];
        var fileName = file ? file.name : "";
        var found = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });
        if (!found) {
            return new ToastError($translate.instant("sms_phonebooks_phonebook_contact_import_file_invalid"));
        }
        return found;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.importContact = function () {
        self.phonecontactForm.isImporting = true;
        return $q.all({
            noop: $timeout(angular.noop, 1000),
            "import": User.Document().Lexi().upload(
                self.phonecontactForm.uploadedFile.name,
                self.phonecontactForm.uploadedFile
            ).then(function (doc) {
                return Sms.Phonebooks().Lexi().import({
                    serviceName: $stateParams.serviceName,
                    bookKey: _.get(self.phonebook, "bookKey")
                }, {
                    documentId: doc.id
                }).$promise;
            })
        }).then(function (result) {
            self.phonecontactForm.isImporting = false;
            self.phonecontactForm.hasBeenImported = true;
            return $timeout(self.close({
                taskId: _.get(result.import, "taskId")
            }), 1000);
        }).catch(function (err) {
            return self.cancel({
                type: "API",
                msg: err
            });
        });
    };

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function (task) {
        return $uibModalInstance.close(task || true);
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.phonebook = angular.copy(phonebook);
        self.phonecontactForm = {
            uploadedFile: null,
            isImporting: false,
            hasBeenImported: false
        };
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
