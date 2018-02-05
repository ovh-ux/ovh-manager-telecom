angular.module("managerApp").controller("TelecomDashboardGuidesCtrl", function (URLS, atInternet) {
    "use strict";

    var self = this;

    self.links = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.links = _.pick(URLS.guides, "packActivate", "modemConfig", "modemReinit");
    }

    self.trackRedirection = function (link) {
        var hit = {
            type: "action",
            level2: "Telecom",
            chapter1: "telecom"
        };

        switch (link) {
        case URLS.guides.packActivate:
            hit.cta = "Activation de mes services";
            hit.name = "Activation_Services";
            break;
        case URLS.guides.modemConfig:
            hit.cta = "Configurer mon modem";
            hit.name = "Setting_Modem";
            break;
        case URLS.guides.modemReinit:
            hit.cta = "Réinitialiser mon modem";
            hit.name = "Reboot_Modem";
            break;
        default: break;
        }

        console.log(hit);
        return atInternet.trackClick(hit);
    };

    /* -----  End of INITIALIZATION  ------*/

    init();

});
