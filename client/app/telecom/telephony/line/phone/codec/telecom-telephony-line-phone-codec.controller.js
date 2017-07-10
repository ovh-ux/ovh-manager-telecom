angular.module("managerApp").controller("TelecomTelephonyLinePhoneCodecCtrl", function ($q, $stateParams, $uibModal, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.codecs = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function refreshCodecs () {
        if (self.line.options.codecs) {
            self.codecs = angular.extend({
                isAutomaticActivated: _.endsWith(self.line.options.codecs, "_a")
            }, _.find(self.line.availableCodecs, {
                value: self.line.options.codecs.replace("_a", "")
            }));
        }
    }

    self.isAutomaticCodecEnabled = function () {
        return _.every(self.line.availableCodecs, {
            automatic: true
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.editCodec = function () {
        var modal = $uibModal.open({
            animation: true,
            templateUrl: "app/telecom/telephony/line/phone/codec/edit/telecom-telephony-line-phone-codec-edit.html",
            controller: "TelecomTelephonyLinePhoneCodecEditCtrl",
            controllerAs: "CodecEditCtrl",
            resolve: {
                lineItem: function () {
                    return self.line;
                }
            }
        });

        modal.result.then(refreshCodecs, function (error) {
            if (error) {
                if (error.type === "API" && !error.init) {
                    Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_save_error"), (error.data && error.data.message) || ""].join(" "));
                } else if (error.type === "API" && error.init) {
                    Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_load_error"), (error.data && error.data.message) || ""].join(" "));
                }
            }
        });

        return modal;
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {

            self.line = group.getLine($stateParams.serviceName);

            return $q.all({
                options: self.line.getOptions(),
                codecList: self.line.getAvailableCodecs()
            }).then(refreshCodecs);

        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_line_phone_codec_load_error"), (error.data && error.data.message) || ""].join(" "));
            return error;
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
