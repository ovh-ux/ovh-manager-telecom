angular.module("managerApp").service("TelecomMediator", function ($q, $translate, OvhApiMeVipStatus, PackMediator, TelephonyMediator, SmsMediator, FaxMediator, OverTheBoxMediator, Toast) {
    "use strict";

    var self = this;

    self.isVip = false;
    self.serviceCount = null;

    self.deferred = {
        vip: null,
        count: null
    };

    /*= =====================================
    =            INITIALIZATION            =
    ======================================*/

    /* ----------  VIP STATUS  ----------*/

    self.initVipStatus = function (force) {
        if (self.deferred.vip && !force) {
            return self.deferred.vip.promise;
        }

        self.deferred.vip = $q.defer();

        // get vip status of connected user
        OvhApiMeVipStatus.v6().get().$promise.then(function (vipStatus) {
            self.isVip = vipStatus.telecom;
            self.deferred.vip.resolve(self.isVip);
        });

        return self.deferred.vip.promise;
    };

    /* ----------  SERVICE COUNT  ----------*/

    self.initServiceCount = function (force) {
        if (self.deferred.count && !force) {
            return self.deferred.count.promise;
        }

        self.deferred.count = $q.defer();

        var countErrors = [];
        var handleCountError = function (err) {
            countErrors.push(_.get(err, "data.message") || err.statusText);
            return $q.when(0);
        };

        // get service count for telecom
        $q.all({
            pack: PackMediator.getCount().catch(handleCountError),
            telephony: TelephonyMediator.getCount().catch(handleCountError),
            sms: SmsMediator.getCount().catch(handleCountError),
            freefax: FaxMediator.getCount().catch(handleCountError),
            overTheBox: OverTheBoxMediator.getCount().catch(handleCountError)
        }).then(function (counts) {
            if (countErrors.length) {
                $translate.refresh().then(function () {
                    Toast.error($translate.instant("sidebar_init_error") + "<br/><br/>" + countErrors.join("<br />"), {
                        hideAfter: false
                    });
                });
            }
            self.deferred.count.resolve(counts);
        });

        return self.deferred.count.promise;
    };

    /* -----  End of INITIALIZATION  ------*/

});
