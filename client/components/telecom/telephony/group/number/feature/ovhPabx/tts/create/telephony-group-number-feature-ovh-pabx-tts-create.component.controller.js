angular.module("managerApp").controller("telephonyNumberOvhPabxTtsCreateCtrl", function ($q, $translate, $translatePartialLoader, TelephonyGroupNumberOvhPabxTts, TelephonyMediator, Toast, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        translations: false,
        creating: false
    };

    self.model = {
        voice: null,
        text: null
    };

    self.availableVoices = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    function resetTtsModel () {
        self.model.voice = _.get(self.availableVoices, "[0].value");
        self.model.text = null;
        self.ttsCreateForm.$setPristine();
    }

    /* -----  End of HELPERS  ------*/

    /*= =============================
    =            EVENTS            =
    ==============================*/

    self.onTtsCreateFormSubmit = function () {
        self.loading.creating = true;

        var tts = new TelephonyGroupNumberOvhPabxTts({
            billingAccount: self.ovhPabx.billingAccount,
            serviceName: self.ovhPabx.serviceName,
            voice: self.model.voice,
            text: self.model.text,
            status: "DRAFT"
        });

        return tts.create().then(function () {
            self.ovhPabx.addTts(tts);
            resetTtsModel();
            if (self.onTtsCreationSuccess && _.isFunction(self.onTtsCreationSuccess())) {
                self.onTtsCreationSuccess()();
            }
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_number_feature_ovh_pabx_tts_create_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.creating = false;
        });
    };

    self.onCancelTtsBtnClick = function () {
        resetTtsModel();
        if (self.onTtsCreationCancel && _.isFunction(self.onTtsCreationCancel())) {
            self.onTtsCreationCancel()();
        }
    };

    /* -----  End of EVENTS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Translations load  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx/tts/create");
        $translatePartialLoader.addPart("../components/telecom/telephony/group/number/feature/ovhPabx/tts");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    /* ----------  Enum  ----------*/

    function getVoiceEnum () {
        return TelephonyMediator.getApiModelEnum("telephony.OvhPabxTtsVoiceEnum").then(function (enumValues) {
            self.availableVoices = _.map(enumValues, function (value) {
                return {
                    value: value,
                    label: $translate.instant("telephony_number_feature_ovh_pabx_tts_voice_" + value.toLowerCase())
                };
            });
        });
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        if (!self.numberCtrl && !self.ovhPabx) {
            throw new Error("telephonyNumberOvhPabxTtsList must have telephonyNumber component as parent or must have ovhPabx attribute specified");
        }

        self.loading.init = true;

        if (!self.ovhPabx) {
            self.ovhPabx = self.numberCtrl.number.feature;
        }

        if (!self.radioName) {
            self.radioName = "ttsChoice";
        }
        self.idPrefix = _.kebabCase(self.radioName);

        return $q.all({
            translations: getTranslations(),
            voiceEnum: getVoiceEnum()
        }).then(function () {
            resetTtsModel();
        }).finally(function () {
            self.loading.init = false;
        }).catch(function (error) {
            return new ToastError(error);
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
