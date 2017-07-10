angular.module("managerApp").controller("voipTimeConditionCalendarCtrl", function ($q, $translate, $translatePartialLoader) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.conditionInEdition = null;
    self.fcEventInEdition = null;

    /*= ==============================
    =            HELPERS            =
    ===============================*/

    /* -----  End of HELPERS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  Load translations  ----------*/

    function getTranslations () {
        self.loading.translations = true;

        $translatePartialLoader.addPart("../components/telecom/telephony/timeCondition/condition");
        return $translate.refresh().finally(function () {
            self.loading.translations = false;
        });
    }

    /* ----------  Component initialization  ----------*/

    self.$onInit = function () {
        self.loading.init = true;

        return $q.all([
            getTranslations(),
            self.timeCondition.getConditions()
        ]).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

});
