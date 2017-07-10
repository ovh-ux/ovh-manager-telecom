angular.module("managerApp").controller("SiteBuildersCtrl", function (SiteBuildersWS, ToastError) {
    "use strict";

    var self = this;
    self.loaders = {
        init: true
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    var init = function () {
        self.loaders.init = true;
        SiteBuildersWS.getSiteBuilders().then(function (siteBuilders) {
            self.siteBuilders = siteBuilders;
        }, function (err) {
            return new ToastError(err);
        }).finally(function () {
            self.loaders.init = false;
        });
    };

    /* -----  End of INITIALIZATION  ------*/

    init();
});
