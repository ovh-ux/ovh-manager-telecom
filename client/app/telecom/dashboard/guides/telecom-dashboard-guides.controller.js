angular.module("managerApp").controller("TelecomDashboardGuidesCtrl", function (URLS) {
    "use strict";

    var self = this;

    self.links = null;

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.links = _.pick(URLS.guides, "packActivate", "modemConfig", "modemReinit");
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
