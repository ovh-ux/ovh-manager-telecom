angular.module('managerApp').controller('OrderOverTheBoxWarningCtrl', function (URLS, REDIRECT_URLS) {
  this.overTheBoxManager = URLS.overTheBoxManager;
  this.guide = URLS.guides.overTheBox;
  this.home = URLS.guides.home;
  this.paymentMeans = REDIRECT_URLS.paymentMeans;
});
