angular.module("managerApp").controller("TelecomTelephonyFaxVoicemailCtrl", function ($q, $stateParams, $translate, TelephonyMediator, Toast) {
    "use strict";

    var self = this;

    self.loading = {
        init: false
    };

    self.fax = null;
    self.actions = null;

    /* =====================================
    =            INITIALIZATION            =
    ====================================== */

    function initActions () {
        var actions = [{
            name: "fax_voicemail_management",
            sref: "telecom.telephony.fax.voicemail.management",
            main: true,
            picto: "ovh-font-messagesRead",
            text: $translate.instant("telephony_group_fax_voicemail_action_management")
        }, {
            name: "fax_voicemail_default",
            sref: "telecom.telephony.fax.voicemail.default",
            text: $translate.instant("telephony_group_fax_voicemail_action_default")
        }, {
            name: "fax_voicemail_password",
            sref: "telecom.telephony.fax.voicemail.password",
            text: $translate.instant("telephony_group_fax_voicemail_action_password")
        }, {
            name: "fax_voicemail_options",
            sref: "telecom.telephony.fax.voicemail.options",
            text: $translate.instant("telephony_group_fax_voicemail_action_options")
        }];

        self.actions = actions;
    }

    self.$onInit = function () {
        self.loading.init = true;

        return TelephonyMediator.getGroup($stateParams.billingAccount).then(function (group) {
            self.fax = group.getFax($stateParams.serviceName);
            initActions();
        }).catch(function (error) {
            Toast.error([$translate.instant("telephony_fax_loading_error"), _.get(error, "data.message", "")].join(" "));
            return $q.reject(error);
        }).finally(function () {
            self.loading.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------ */

});
