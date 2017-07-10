angular.module("managerApp").controller("TelecomTelephonyAliasConfigurationOvhPabxSoundsCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.model = {
        file: null
    };

    self.number = null;
    self.uploadErrors = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.hasError = function () {
        return self.uploadErrors.extension || self.uploadErrors.size || self.uploadErrors.name || self.uploadErrors.exists;
    };

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.number = group.getNumber($stateParams.serviceName);

            return self.number.feature.init().then(function () {
                if (self.number.getFeatureFamily() === "ovhPabx") {
                    return self.number.feature.getSounds();
                }
                return null;
            });
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_alias_configuration_load_error"), (error.data && error.data.message) || ""].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
