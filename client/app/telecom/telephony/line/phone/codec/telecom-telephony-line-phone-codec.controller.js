angular.module("managerApp").controller("TelecomTelephonyLinePhoneCodecCtrl", function ($q, $stateParams, $uibModal, $translate, TelephonyMediator, Toast, OvhApiTelephonyLinePhoneLexi, telephonyBulk, telecomVoip) {
    "use strict";

    var self = this;
    var mustCheckPhones = true;

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

    self.hasChanged = function () {
        return self.model.codecs && self.codecs.value !== self.model.codecs.value;
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
            if (error.type === "API" && !error.init) {
                Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_save_error"), (error.data && error.data.message) || ""].join(" "));
            } else if (error.type === "API" && error.init) {
                Toast.error([$translate.instant("telephony_line_phone_codec_edit_codec_load_error"), (error.data && error.data.message) || ""].join(" "));
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

            if (mustCheckPhones) {
                // parallel filtering services with phone(s)
                telecomVoip.fetchAll().then(function (billingAccounts) {

                    self.servicesWithPhone = _.chain(billingAccounts).map("services").flatten().filter(function (service) {
                        return ["sip", "mgcp"].indexOf(service.featureType) > -1;
                    }).value();

                    self.getServicesWithPhone().then(function () {
                        self.isCheckingPhones = false;
                        self.servicesWithPhone = _.filter(self.servicesWithPhone, function (service) {
                            return service.hasPhone;
                        });
                    });
                }).finally(function () {
                    self.loading.init = false;
                });
            } else {
                self.loading.init = false;
            }
        });
    }

    // chain calls to check services with phone
    self.getServicesWithPhone = function () {
        self.isCheckingPhones = true;
        var chain = $q.when();

        _.forEach(self.servicesWithPhone, function (service) {
            chain = chain.then(testServiceHasPhone(service.billingAccount, service.serviceName)).then(function () {
                service.hasPhone = true;
            }, angular.noop);
        });

        return chain;
    };

    function testServiceHasPhone (billingAccount, serviceName) {
        return function () {
            return OvhApiTelephonyLinePhoneLexi.get({ billingAccount: billingAccount, serviceName: serviceName }).$promise;
        };
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

    self.filterServices = function () {
        return self.servicesWithPhone;
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

        TelephonyMediator.resetAllCache();
        self.saveNewCodec();

        // reset initial values to be able to modify again the options, without re-checking for service with phones
        mustCheckPhones = false;
        init();
    };

    self.onBulkError = function (error) {
        Toast.error([$translate.instant("telephony_line_phone_codec_bulk_on_error"), _.get(error, "msg.data")].join(" "));
    };

    /* -----  End of BULK  ------ */

    init();
});
