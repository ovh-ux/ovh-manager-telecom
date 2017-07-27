angular.module("managerApp").controller("TelecomTelephonyLineFaxCtrl", function ($translate, TelecomMediator, TelephonyMediator) {
    "use strict";

    var self = this;

    self.actions = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.actions = [{
            name: "line_password",
            sref: "telecom.telephony.line.fax.password",
            text: $translate.instant("telephony_line_fax_actions_line_password")
        }, {
            name: "line_settings",
            sref: "telecom.telephony.line.fax.settings",
            text: $translate.instant("telephony_line_fax_actions_line_settings")
        }, {
            name: "line_white_label_domains",
            sref: "telecom.telephony.line.fax.customDomains",
            text: $translate.instant("telephony_line_fax_actions_line_white_label_domains"),
            disabled: !TelecomMediator.isVip
        }, {
            name: "line_filtering",
            url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_fax_filtering"),
            text: $translate.instant("telephony_line_fax_actions_line_filtering")
        }, {
            name: "line_campaign_management",
            sref: "telecom.telephony.line.fax.campaigns",
            text: $translate.instant("telephony_line_fax_actions_line_campaigns")
        }, {
            name: "line_convert_to_ecofax_pro",
            url: TelephonyMediator.getV6ToV4RedirectionUrl("line.line_convert_to_ecofax_pro"),
            text: $translate.instant("telephony_line_fax_actions_line_convert_to_ecofax_pro")
        }];
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
