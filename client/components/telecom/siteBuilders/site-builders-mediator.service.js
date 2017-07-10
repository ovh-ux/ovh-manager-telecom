angular.module("managerApp").service("SiteBuildersMediator", function (SiteBuildersWS) {
    "use strict";

    var self = this;

    /*= ============================
    =            COUNT            =
    =============================*/

    self.getCount = function () {
        return SiteBuildersWS.getSiteBuilders().then(function (siteBuilders) {
            return siteBuilders.length;
        }, function () {
            return 0;
        });
    };

    /* -----  End of COUNT  ------*/

});
