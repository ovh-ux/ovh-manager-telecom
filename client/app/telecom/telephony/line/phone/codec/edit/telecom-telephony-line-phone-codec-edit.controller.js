angular.module("managerApp").controller("TelecomTelephonyLinePhoneCodecEditCtrl", function ($timeout, $uibModalInstance, lineItem) {
    "use strict";

    var self = this;

    self.line = null;
    self.availableCodecs = null;
    self.model = {
        value: null,
        auto: false
    };

    self.loading = {
        save: false
    };

    self.saved = false;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    self.isAutomaticCodecEnabled = function () {
        return _.every(self.line.availableCodecs, {
            automatic: true
        });
    };

    /* -----  End of HELPERS  ------*/

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.cancel = function (message) {
        return $uibModalInstance.dismiss(message);
    };

    self.close = function () {
        return $uibModalInstance.close(true);
    };

    self.saveNewCodec = function () {
        self.loading.save = true;

        return self.line.saveOption("codecs", self.model.auto ? self.model.codecs.value + "_a" : self.model.codecs.value).then(function () {
            self.saved = true;

            return $timeout(self.close, 1000);
        }, function (error) {
            return self.cancel(angular.extend(error, {
                type: "API"
            }));
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
        self.line = lineItem;
        self.model.codecs = self.line.options.codecs ? _.find(self.line.availableCodecs, {
            value: self.line.options.codecs.replace("_a", "")
        }) : null;
        self.model.auto = _.endsWith(self.line.options.codecs, "_a") && self.isAutomaticCodecEnabled();
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
