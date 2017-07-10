angular.module("managerApp").controller("TelecomSmsCtrl", function ($q, $stateParams, $translate, SmsMediator, SidebarMenu, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.service = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.serviceNameSave = function (newServiceDescription) {
        self.service.startEdition();
        self.service.description = newServiceDescription;
        return self.service.save().then(function () {
            self.service.stopEdition();
            SidebarMenu.updateItemDisplay({
                title: self.service.getDisplayedName()
            }, self.service.name, "telecom-sms-section");
        }, function (error) {
            self.service.stopEdition(true);
            Toast.error([$translate.instant("sms_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of ACTIONS  ------*/

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.init = true;

        SmsMediator.initDeferred.promise.then(function () {
            self.service = SmsMediator.getCurrentSmsService();
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
