angular.module("managerApp").controller("OrderOverTheBoxWarningCtrl", function (URLS, REDIRECT_URLS) {
    "use strict";
    this.overTheBoxManager = URLS.overTheBoxManager;
    this.guide = URLS.guides.overTheBox;
    this.home = URLS.guides.home;
    this.paymentMeans = REDIRECT_URLS.paymentMeans;
});
