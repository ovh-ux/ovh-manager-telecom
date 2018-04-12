angular.module("managerApp").controller("TelecomTelephonyBillingAccountPhonebookContactImportCtrl", function ($q, $stateParams, $timeout, $translate, $uibModalInstance, bookKey, OvhApiTelephony, OvhApiMe, ToastError) {
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
            ToastError($translate.instant("telephony_phonebook_contact_action_import_file_invalid"));
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
            "import": OvhApiMe.Document().v6().upload(
                self.phonecontactForm.uploadedFile.name,
                self.phonecontactForm.uploadedFile
            ).then(function (doc) {
                return OvhApiTelephony.Phonebook().v6().import({
                    billingAccount: $stateParams.billingAccount,
                    bookKey: bookKey
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
        self.phonecontactForm = {
            uploadedFile: null,
            isImporting: false,
            hasBeenImported: false
        };
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
