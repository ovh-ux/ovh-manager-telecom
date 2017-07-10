angular.module("managerApp").controller("telephonyNumberOvhPabxSoundUploaderCtrl", function ($q, $translate, Toast) {
    "use strict";

    var self = this;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function getFileNameToWav (fileName) {
        var splittedFileName = fileName.split(".");
        var extension = _.last(splittedFileName);
        if (extension === "wav") {
            return fileName;
        }

        // remove exension from file name
        splittedFileName.pop();

        // return new file name to wav format
        return splittedFileName.join(".").replace(/ /g, "_") + ".wav";
    }

    function validateFile () {
        // decode file extension
        var validExtensions = ["ogg", "mp3", "wav", "wma"];
        var fileName = self.file ? self.file.name : "";
        var fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf("."));
        var isValidFormat = _.some(validExtensions, function (ext) {
            return _.endsWith(fileName.toLowerCase(), "." + ext);
        });
        var nameRegex = new RegExp(/^[\w\s]{1,26}$/, "g");

        // check for errors
        if (!isValidFormat) {
            // check for format
            self.$errors.extension = true;
            return false;
        } else if (!nameRegex.test(fileNameWithoutExtension)) {
            // check for file name
            self.$errors.name = true;
            return false;
        } else if (self.file.size > 10000000) {
            // check for file size
            self.$errors.size = true;
            return false;
        }
        self.$errors.exists = _.some(self.ovhPabx.sounds, {
            name: getFileNameToWav(fileName)
        });
        return !self.$errors.exists;

    }

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onSoundFileChoosed = function (file) {
        // set model
        self.file = file;

        // reset errors
        self.$errors.extension = false;
        self.$errors.size = false;
        self.$errors.name = false;
        self.$errors.exists = false;

        // validate file
        if (!validateFile()) {
            return self.$errors;
        }

        // no errors add to sounds list
        var sound = self.ovhPabx.addSound({
            billingAccount: self.ovhPabx.billingAccount,
            serviceName: self.ovhPabx.serviceName,
            name: getFileNameToWav(self.file.name),
            status: "IN_CREATION"
        });

        // start upload
        return sound.upload(self.file).then(function () {
            return self.ovhPabx.getSounds();
        }, function (error) {
            var errorMsg = $translate.instant("telephony_number_feature_ovh_pabx_sound_upload_error", {
                file: sound.name
            });
            self.ovhPabx.removeSound(sound);
            Toast.error([errorMsg, error.message || (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.file = null;
        });
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.$errors = {
            extension: false,
            size: false,
            name: false,
            exists: false
        };
    };

    /* -----  End of INITIALIZATION  ------*/

});
