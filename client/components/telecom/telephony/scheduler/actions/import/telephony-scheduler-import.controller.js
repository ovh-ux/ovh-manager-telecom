angular.module("managerApp").controller("TelephonySchedulerImportCtrl", function ($timeout, $uibModalInstance, modalData, OvhApiMe) {
    "use strict";

    var self = this;

    self.model = {
        icsFile: null
    };

    self.status = {
        uploaded: false
    };

    self.loading = {
        "import": false
    };

    self.isFileExtentionInvalid = false;
    self.scheduler = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function uploadFile () {
        return OvhApiMe.Document().v6().upload(self.model.icsFile.name, self.model.icsFile);
    }

    self.checkIcsFileType = function (file) {
        if (_.isNull(file)) {
            self.isFileExtentionInvalid = false;
        } else {
            var validExtensions = ["ics", "ical"];
            var fileName = file ? file.name : "";
            self.isFileExtentionInvalid = !_.some(validExtensions, function (ext) {
                return _.endsWith(fileName.toLowerCase(), ext);
            });
        }
        return self.isFileExtentionInvalid;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function (datas) {
        return $uibModalInstance.close(datas);
    };

    self.startImport = function () {
        self.loading.import = true;

        // upload file to /me/document
        return uploadFile().then(function (document) {
            // launch scheduler calendar import
            return self.scheduler.importIcsCalendar(document.getUrl).then(function (importTask) {
                self.status.uploaded = true;

                return $timeout(function () {
                    self.close({
                        importTask: importTask,
                        uploadedDocument: document
                    });
                }, 1000);
            });
        }).catch(function (error) {
            return self.cancel(error);
        }).finally(function () {
            self.loading.import = false;
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.scheduler = modalData.scheduler;
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
