angular.module("managerApp").controller("TelecomTelephonyLinePhoneCodecCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast, OvhApiTelephony, telephonyBulk, voipLinePhone) {
    "use strict";

    var self = this;
    var codecsAuto = null;

    self.loading = {
        init: false
    };

    self.model = {
        codecs: null
    };

    self.codecs = null;
    self.servicesWithPhone = [];
    self.isCheckingPhones = false;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function refreshCodecs () {
        if (self.line.options.codecs) {
            self.model.codecs = _.find(self.line.availableCodecs, {
                value: _.trim(self.line.options.codecs, "_a")
            });

            codecsAuto = _.endsWith(self.line.options.codecs, "_a");

            self.codecs = angular.extend({
                isAutomaticActivated: _.endsWith(self.line.options.codecs, "_a")
            }, _.find(self.line.availableCodecs, {
                value: self.line.options.codecs.replace("_a", "")
            }));

            self.model.auto = self.codecs.isAutomaticActivated;
        }
    }

    self.isAutomaticCodecEnabled = function () {
        return _.every(self.line.availableCodecs, {
            automatic: true
        });
    };

    self.hasChanged = function () {
        return (self.model.codecs && self.codecs.value !== self.model.codecs.value) || self.model.auto !== codecsAuto;
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.saveNewCodec = function () {

        self.loading.save = true;

        return self.line.saveOption("codecs", self.model.auto ? self.model.codecs.value + "_a" : self.model.codecs.value).then(function () {
            self.saved = true;
            Toast.success([$translate.instant("telephony_line_phone_codec_edit_codec_save_success")]);
            refreshCodecs();

        }, function (error) {
            if (error.init) {
                Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_load_error"), (error.data && error.data.message) || ""].join(" "));
            } else {
                Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_save_error"), (error.data && error.data.message) || ""].join(" "));
            }
        }).finally(function () {
            self.loading.save = false;
        });
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

    /* ===========================
    =            BULK            =
    ============================ */

    self.bulkDatas = {
        billingAccount: $stateParams.billingAccount,
        serviceName: $stateParams.serviceName,
        infos: {
            name: "codecs",
            actions: [{
                name: "options",
                route: "/telephony/{billingAccount}/line/{serviceName}/options",
                method: "PUT",
                params: null
            }]
        }
    };

    self.filterServices = function (services) {
        var filteredServices = _.filter(services, function (service) {
            return ["sip", "mgcp"].indexOf(service.featureType) > -1;
        });

        return voipLinePhone.fetchAll().then((voipLinePhones) => {
            filteredServices = _.filter(filteredServices, function (service) {
                return _.some(voipLinePhones, { serviceName: service.serviceName, billingAccount: service.billingAccount });
            });
            return $q.when(filteredServices);
        });
    };

    self.getBulkParams = function () {
        var data = {
            codecs: self.model.auto ? self.model.codecs.value + "_a" : self.model.codecs.value
        };

        return data;
    };

    self.onBulkSuccess = function (bulkResult) {
        // display message of success or error
        telephonyBulk.getToastInfos(bulkResult, {
            fullSuccess: $translate.instant("telephony_line_phone_codec_bulk_all_success"),
            partialSuccess: $translate.instant("telephony_line_phone_codec_bulk_some_success", {
                count: bulkResult.success.length
            }),
            error: $translate.instant("telephony_line_phone_codec_bulk_error")
        }).forEach(function (toastInfo) {
            Toast[toastInfo.type](toastInfo.message, {
                hideAfter: null
            });
        });

        OvhApiTelephony.Line().Options().resetCache();
        TelephonyMediator.resetAllCache();
        TelephonyMediator.init();

        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_phone_codec_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
