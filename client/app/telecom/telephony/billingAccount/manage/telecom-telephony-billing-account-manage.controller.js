angular.module("managerApp").controller("TelecomTelephonyBillingAccountManageCtrl", function ($translate, $stateParams, TelephonyMediator, ToastError) {
    "use strict";

    var self = this;

    self.loading = {
        init: false,
        save: false
    };

    self.group = null;
    self.links = null;

    /*= ==============================
    =            ACTIONS            =
    ===============================*/

    self.saveName = function () {
        self.loading.save = true;

        return self.group.save().then(function () {
            self.group.stopEdition();
        }, function () {
            self.group.stopEdition(true);
            return new ToastError($translate.instant("telephony_group_manage_error_rename", $stateParams));
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

        TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.group = group;

            self.links = {
                contactList: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_manage_phonebook"),
                shortNumbers: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_abreviated_numbers"),
                contactManagement: TelephonyMediator.getV6ToV4RedirectionUrl("group.group_nics_management")
            };

        }, function () {
            return new ToastError($translate.instant("telephony_group_manage_loading_error", $stateParams));
        }).finally(function () {
            self.loading.init = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
