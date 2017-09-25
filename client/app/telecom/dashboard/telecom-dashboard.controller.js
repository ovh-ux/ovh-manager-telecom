angular.module("managerApp").controller("TelecomDashboardCtrl", function (TelecomMediator, ToastError, URLS, matchmedia, atInternet) {
    "use strict";

    var self = this;

    self.loading = {
        vip: false
    };

    self.expressLiteOrder = URLS.orderExpressLite;
    self.isVip = false;
    self.isMobile = false;
    self.isFr = false;

    matchmedia.on("(max-width: 1279px)", function (mediaQueryList) {
        self.isMobile = mediaQueryList.matches;
    });

    self.onRegisterLinkClick = function () {
        atInternet.trackClick({
            name: "Summit-banner",
            type: "action",
            level2: "5"
        });

        return true;
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    function init () {
        self.loading.vip = true;

        if (localStorage && localStorage.getItem("univers-selected-language")) {
            self.isFr = _.startsWith(localStorage.getItem("univers-selected-language"), "fr");
        }

        return TelecomMediator.deferred.vip.promise.then(function (vipStatus) {
            self.isVip = vipStatus;
        }, function (err) {
            return new ToastError(err, "telecom_dashboard_auth_failed");
        }).finally(function () {
            self.loading.vip = false;
        });
    }

    /* -----  End of INITIALIZATION  ------*/

    init();

});
