angular.module("managerApp").controller("TelecomWelcomingCtrl", function ($q, URLS, REDIRECT_URLS, OvhApiTelephony, OvhApiPackXdsl, OvhApiFreeFax, OvhApiOverTheBox, OvhApiSms) {
    "use strict";
    var self = this;
    this.servicesCount = 0;
    this.hasServices = false;
    this.loaders = {
        init: false
    };
    this.webSite = URLS.telecomWebSite;
    this.v4Url = REDIRECT_URLS.telephonyV4;

    /** @TODO uncommend when API V7 available for /telephony */
    /*
    self.getTelephonyCount = function getTelephonyCount () {
        return OvhApiTelephony.Erika().query().execute().$promise.then(function (telephonyGroupsIds) {
            return telephonyGroupsIds.length;
        }, function () {
            return 0;
        });
    };
    */

    /** @TODO delete when API V7 available for /telephony */
    self.getTelephonyCount = function getTelephonyCount () {
        return OvhApiTelephony.Lexi().query().$promise.then(function (telephonyGroupsIds) {
            return telephonyGroupsIds.length;
        }, function () {
            return 0;
        });
    };

    self.getPackCount = function getPackCount () {
        return OvhApiPackXdsl.Erika().query().execute().$promise.then(function (packIds) {
            return packIds.length;
        }, function () {
            return 0;
        });
    };

    self.getFaxCount = function getFaxCount () {
        return OvhApiFreeFax.Erika().query().execute().$promise.then(function (freeFaxIds) {
            return freeFaxIds.length;
        }, function () {
            return 0;
        });
    };

    self.getOTBCount = function () {
        return OvhApiOverTheBox.Lexi().query().$promise.then(function (otbIds) {
            return otbIds.length;
        }, function () {
            return 0;
        });
    };

    self.getSmsCount = function () {
        return OvhApiSms.Lexi().query().$promise.then(function (smsIds) {
            return smsIds.length;
        }, function () {
            return 0;
        });
    };

    self.getCount = function getCount () {
        return $q.all([
            self.getTelephonyCount(),
            self.getPackCount(),
            self.getFaxCount(),
            self.getOTBCount(),
            self.getSmsCount()
        ]).then(function (count) {
            return {
                telephony: count[0],
                pack: count[1],
                fax: count[2],
                overTheBox: count[3],
                sms: count[4]
            };
        });
    };

    var init = function () {
        self.servicesCount = 0;
        self.loaders.init = true;
        self.hasServices = false;

        return self.getCount().then(function (servicesCount) {
            var globalCount = 0;
            angular.forEach(servicesCount, function (count) {
                if (angular.isNumber(count)) {
                    globalCount += count;
                }
            });
            self.hasServices = !!globalCount;
            self.servicesCount = servicesCount;
            return self.servicesCount;
        }).finally(function () {
            self.loaders.init = false;
        });
    };

    init();
});
