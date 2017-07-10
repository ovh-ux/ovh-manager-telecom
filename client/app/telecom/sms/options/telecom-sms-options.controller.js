angular.module("managerApp").controller("TelecomSmsOptionsCtrl", function ($translate) {
    "use strict";

    var self = this;

    self.actions = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.actions = [{
            name: "options_manage",
            sref: "telecom.sms.options.manage",
            text: $translate.instant("sms_options_manage")
        }, {
            name: "options_response",
            sref: "telecom.sms.options.response",
            text: $translate.instant("sms_options_response")
        }, {
            name: "options_recredit",
            sref: "telecom.sms.options.recredit",
            text: $translate.instant("sms_options_recredit")
        }];
    }

    /* -----  End of INITIALIZATION  ------*/

    init();
});
