angular.module("managerApp").controller("TelecomTelephonyFaxCtrl", function ($q, $stateParams, $translate, TelecomMediator, TelephonyMediator, SidebarMenu, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.fax = null;
    self.actions = null;

    /* ===============================
    =            ACTIONS            =
    =============================== */

    self.faxNameSave = function (newServiceDescription) {
        self.fax.startEdition();
        self.fax.description = newServiceDescription;
        return self.fax.save().then(function () {
            self.fax.stopEdition();
            SidebarMenu.updateItemDisplay({
                title: self.fax.getDisplayedName()
            }, self.fax.serviceName, "telecom-telephony-section", self.fax.billingAccount);
        }, function (error) {
            self.fax.stopEdition(true);
            Toast.error([$translate.instant("telephony_fax_rename_error", $stateParams), error.data.message].join(" "));
            return $q.reject(error);
        });
    };

    /* -----  End of ACTIONS  ------ */

    /* ======================================
    =            INITIALIZATION            =
    ====================================== */

    function initActions () {
        self.actions = [{
            name: "line_fax_password",
            sref: "telecom.telephony.fax.password",
            text: $translate.instant("telephony_fax_actions_line_fax_password")
        }, {
            name: "line_fax_options",
            sref: "telecom.telephony.fax.settings",
            text: $translate.instant("telephony_fax_actions_line_fax_options")
        }, {
            name: "line_fax_white_label_domains",
            url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_fax_white_label_domains"),
            text: $translate.instant("telephony_fax_actions_line_fax_white_label_domains"),
            disabled: !TelecomMediator.isVip
        }, {
            name: "line_fax_filtering",
            url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_fax_filtering"),
            text: $translate.instant("telephony_fax_actions_line_fax_filtering")
        }, {
            name: "line_fax_campaign_management",
            sref: "telecom.telephony.fax.campaigns",
            text: $translate.instant("telephony_fax_actions_line_fax_campaign_management")
        }, {
            name: "line_convert_to_ecofax_pro",
            url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_convert_to_ecofax_pro"),
            text: $translate.instant("telephony_fax_actions_line_convert_to_ecofax_pro")
        }];
    }

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
