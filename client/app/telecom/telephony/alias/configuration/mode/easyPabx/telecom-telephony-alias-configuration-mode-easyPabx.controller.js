angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationModeEasyPabxCtrl", function ($q, $translate, $stateParams, TelephonyMediator, OvhApiTelephony, OvhApiTelephonyEasyPabx, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.number = null;
    self.enums = null;
    self.options = null;

    /* ==============================
    =            HELPERS            =
    =============================== */

    function fetchEnums () {
        return OvhApiTelephony.Lexi().schema().$promise.then(function (result) {
            var enums = {};
            enums.pattern = _.get(result, ["models", "telephony.EasyMiniPabxHuntingPatternEnum", "enum"]);
            enums.strategy = _.get(result, ["models", "telephony.EasyMiniPabxHuntingStrategyEnum", "enum"]);
            return enums;
        });
    }

    function fetchHunting () {
        return OvhApiTelephonyEasyPabx.Lexi().getHunting({
            billingAccount: $stateParams.billingAccount,
            serviceName: $stateParams.serviceName
        }).$promise;
    }

    function fetchVoicemail () {
        return OvhApiTelephony.Voicemail().Lexi().query({
            billingAccount: $stateParams.billingAccount
        }).$promise;
    }

    /* -----  End of HELPERS  ------ */

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                return $q.all({
                    enums: fetchEnums(),
                    hunting: fetchHunting(),
                    voicemail: fetchVoicemail(),
                }).then(function (result) {
                    self.enums = result.enums;
                    self.options = result.hunting;
                    self.voicemail = result.voicemail;
                });
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_mode_easy_pabx_loading_error"), _.get(error, "data.message")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
