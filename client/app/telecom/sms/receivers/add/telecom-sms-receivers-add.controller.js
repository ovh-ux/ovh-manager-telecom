angular.module("managerApp").controller("TelecomSmsReceiversAddCtrl", function ($q, $stateParams, $timeout, $translate, $uibModalInstance, Sms, User, slot, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        addReceiver: false
    };

    self.added = false;

    self.receiverForm = {
        description: null,
        url: null,
        uploadedFile: null,
        autoUpdate: false
    };

    self.urlMode = false;

    self.requirement = false;
    self.lineErrors = null;

    self.slot = slot;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.checkValidTextExtention = function (file) {
        var validExtensions = ["csv", "txt"];
        var fileName = file ? file.name : "";
        var found = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), ext);
        });
        if (!found) {
            return new ToastError($translate.instant("sms_receivers_add_file_invalid"));
        }
        return found;
    };

    function uploadFile (file) {
        return User.Document().Lexi().upload(
            file.name,
            file
        );
    }

    function createReceiversList () {
        var promise = null;
        self.lineErrors = null;
        if (self.urlMode) {
            promise = Sms.Receivers().Lexi().create({
                serviceName: $stateParams.serviceName
            }, {
                autoUpdate: self.receiverForm.autoUpdate,
                csvUrl: self.receiverForm.url,
                description: self.receiverForm.description,
                slotId: _.head(self.slot.available)
            }).$promise;
        } else {
            promise = uploadFile(self.receiverForm.uploadedFile).then(function (doc) {
                return Sms.Receivers().Lexi().create({
                    serviceName: $stateParams.serviceName
                }, {
                    autoUpdate: self.receiverForm.autoUpdate,
                    documentId: doc.id,
                    description: self.receiverForm.description,
                    slotId: _.head(self.slot.available)
                }).$promise;
            });
        }
        return promise.catch(function (err) {
            var message = _.get(err, "data.message");
            if (message) {
                var lineErrors = message.match(/on line (\d+)$/);
                if (_.isArray(lineErrors)) {
                    self.lineErrors = _.last(lineErrors);
                }
            }
            self.loading.addReceiver = false;
            self.requirement = true;
        });
    }

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.add = function () {
        self.loading.addReceiver = true;
        self.requirement = false;

        return $q.all([
            createReceiversList(),
            $timeout(angular.noop, 1000)
        ]).then(function () {
            self.loading.addReceiver = false;

            if (!self.requirement && !self.lineErrors) {
                self.added = true;
                return $timeout(self.close, 1000);
            }
            return null;
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
});
