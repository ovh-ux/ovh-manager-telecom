angular.module("managerApp").controller("TelecomSmsSmsCtrl", function ($translate) {
    "use strict";

    var self = this;

    self.actions = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.actions = [{
            name: "sms_compose",
            main: true,
            picto: "ovh-font-sms",
            sref: "telecom.sms.sms.compose",
            text: $translate.instant("sms_sms_compose")
        }, {
            name: "sms_history",
            main: true,
            picto: "ovh-font-SMSEmitting",
            sref: "telecom.sms.sms.outgoing",
            text: $translate.instant("sms_sms_history")
        }, {
            name: "sms_received",
            main: true,
            picto: "ovh-font-SMSReceiving",
            sref: "telecom.sms.sms.incoming",
            text: $translate.instant("sms_sms_received")
        }, {
            name: "sms_pending",
            main: true,
            picto: "ovh-font-SMSPlanned",
            sref: "telecom.sms.sms.pending",
            text: $translate.instant("sms_sms_pending")
        }, {
            name: "sms_manage_hlrs",
            sref: "telecom.sms.sms.hlr",
            text: $translate.instant("sms_sms_manage_hlrs")
        }, {
            name: "sms_manage_templates",
            sref: "telecom.sms.sms.templates",
            text: $translate.instant("sms_sms_manage_templates")
        }];
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
