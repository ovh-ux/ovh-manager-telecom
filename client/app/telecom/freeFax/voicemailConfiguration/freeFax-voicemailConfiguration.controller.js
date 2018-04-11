angular.module("managerApp").controller("FreeFaxVoicemailConfigurationCtrl", function ($scope, $stateParams, OvhApiFreeFax, Toast, $translate, ToastError, $q, FREEFAX) {
    "use strict";

    var self = this;
    var initialActivateVoiceMail;

    self.serviceName = $stateParams.serviceName;

    function init () {

        self.loading = true;
        self.editMode = false;

        self.audioFormatList = [];
        FREEFAX.audioFormat.forEach(function (audioFormat) {
            self.audioFormatList.push({
                label: audioFormat,
                value: audioFormat
            });
        });


        return OvhApiFreeFax.v6().voiceMailGet({
            serviceName: $stateParams.serviceName
        }).$promise.then(function (voiceMail) {
            self.voiceMail = voiceMail;
            self.voiceMailPassword = "";
            self.voiceMail.audioFormat = _.find(self.audioFormatList, { value: self.voiceMail.audioFormat });
            return self.voiceMail;
        }, function (err) {
            return new ToastError(err);
        }).then(function () {
            return OvhApiFreeFax.v6().voiceMailGetRouting({
                serviceName: $stateParams.serviceName
            }).$promise.then(function (routing) {
                initialActivateVoiceMail = routing.value;
                self.voiceMail.activateVoiceMail = routing.value === "voicemail";
                return self.voiceMail;
            }, function (err) {
                self.voiceMail.activateVoiceMail = false;
                return new ToastError(err);
            });
        }).finally(function () {
            self.loading = false;
        });
    }

    this.cancelEditMode = function () {
        self.voiceMail = JSON.parse(self.savedConf);
        self.voiceMail.audioFormat = _.find(self.audioFormatList, { value: self.voiceMail.audioFormat.value });
        self.editMode = false;
    };

    this.enterEditMode = function () {
        self.password = [
            "",
            ""
        ];
        self.savedConf = JSON.stringify(self.voiceMail);
        self.editMode = true;
    };

    this.saveConfiguration = function (conf) {
        var tasks = [
            self.save(conf)
        ];

        if (self.password[0]) {
            tasks.push(self.changePassword(self.password[0]));
        }

        $q.all(tasks).then(function () {
            Toast.success($translate.instant("freefax_voicemail_success"));
            init();
        }, ToastError);
    };

    this.validPassword = function (val) {
        return (/^[0-9]{4}$/).test(val) || !val;
    };

    this.validName = function (val) {
        return (/^[\wàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅå\s\-_']*$/).test(val) || !val;
    };

    this.checkPassword = function () {
        return (self.password[0] === self.password[1]) &&
            self.validPassword(self.password[0]);
    };

    this.save = function (conf) {
        var tasks = [
            OvhApiFreeFax.v6().voiceMailPut({
                serviceName: $stateParams.serviceName
            }, {
                audioFormat: conf.audioFormat.value,
                forcePassword: conf.forcePassword,
                fromEmail: conf.fromEmail,
                fromName: conf.fromName,
                keepMessage: conf.keepMessage

            }).$promise
        ];

        if ((conf.activateVoiceMail && initialActivateVoiceMail !== "voicemail") || (!conf.activateVoiceMail && initialActivateVoiceMail !== "fax")) {
            tasks.push(
                OvhApiFreeFax.v6().voiceMailChangeRouting({
                    serviceName: $stateParams.serviceName
                }, {
                    routing: conf.activateVoiceMail ? "voicemail" : "fax"
                }).$promise
            );
        }
        return $q.all(tasks);
    };

    this.changePassword = function (newPassword) {
        return $q(function (resolve, reject) {
            if (!self.checkPassword()) {
                Toast.error($translate.instant("freefax_voicemail_bad_password"));
                reject($translate.instant("freefax_voicemail_bad_password"));
            } else {
                OvhApiFreeFax.v6().changePassword({
                    serviceName: $stateParams.serviceName
                }, {
                    password: newPassword
                }).$promise.then(resolve, reject);
            }
        });

    };

    init();
});
