angular.module("managerApp").controller("TelecomTelephonyLineAssistSupportCtrl", function ($stateParams, TelephonyMediator, OtrsPopupService, URLS) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.guideUrl = URLS.guides.telephony;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.openSupportTicket = function () {
        if (!OtrsPopupService.isLoaded()) {
            OtrsPopupService.init();
        } else {
            OtrsPopupService.toggle();
        }
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
