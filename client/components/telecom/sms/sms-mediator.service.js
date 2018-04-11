angular.module("managerApp").service("SmsMediator", function ($q, OvhApiSms, SmsService, SMS_REGEX, SMS_STOP_CLAUSE) {
    "use strict";

    var self = this;
    var currentSms = null;
    var smsText = {
        coding: "7bit",
        defaultSize: 160,
        remainingCharacters: null,
        equivalence: null,
        threshold: null,
        maxlength: null
    };

    self.smsServices = {}; // access to SmsService by name
    self.initDeferred = null;
    self.apiScheme = null;

    self.getApiScheme = function () {
        if (!self.apiScheme) {
            return OvhApiSms.v6().schema().$promise.then(function (scheme) {
                self.apiScheme = scheme;
                return self.apiScheme;
            });
        }
        return $q.when(self.apiScheme);
    };

    /*= ============================
        =         SMS SERVICE         =
        =============================*/

    self.getAccounts = function () {
        return self.smsServices;
    };

    /* ----------  CURRENT SMS SERVICE  ----------*/

    self.setCurrentSmsService = function (smsService) {
        currentSms = smsService;
        return currentSms;
    };

    self.getCurrentSmsService = function () {
        if (!currentSms) { throw new Error("SMS service is not set"); }
        return currentSms;
    };

    /* ----------  ACTIONS  ----------*/

    function addSmsService (smsOptions) {
        var addedSms = new SmsService(smsOptions);

        if (!self.smsServices[addedSms.name]) {
            self.smsServices[addedSms.name] = addedSms;
            return addedSms;
        }
        return null;

    }

    /* -----  End of SMS SERVICE  ------*/

    /*= ============================
        =            COUNT            =
        =============================*/

    self.getCount = function () {
        // return OvhApiSms.v7().query().execute().$promise.then(function (smsIds) {
        return OvhApiSms.v6().query().$promise.then(function (smsIds) {
            return smsIds.length;
        });
    };

    /* -----  End of COUNT  ------*/

    /*= ========================================
        =            GET SMS INFO TEXT            =
        =========================================*/

    self.getSmsInfoText = function (messageParam, suffix, threshold) {
        var message = messageParam || "";
        smsText.threshold = threshold || 255;

        var length = message.length + (suffix ? SMS_STOP_CLAUSE.value.length : 0);

        if (message.match(SMS_REGEX.default7bitGSMAlphabet)) {
            smsText.coding = "7bit";
            if (length <= 160) {
                smsText.defaultSize = 160;
                smsText.equivalence = 1;
                smsText.remainingCharacters = smsText.defaultSize - length;
            } else if (length > 160 && length <= 306) {
                smsText.defaultSize = 146;
                smsText.equivalence = 2;
                smsText.remainingCharacters = 306 - length;
            } else {
                smsText.defaultSize = 153;
                smsText.equivalence = Math.ceil(length / smsText.defaultSize);
                smsText.remainingCharacters = (smsText.defaultSize * smsText.equivalence) - length;
            }
        } else {
            smsText.coding = "8bit";
            if (length <= 70) {
                smsText.defaultSize = 70;
                smsText.equivalence = 1;
                smsText.remainingCharacters = smsText.defaultSize - length;
            } else if (length > 70 && length <= 134) {
                smsText.defaultSize = 64;
                smsText.equivalence = 2;
                smsText.remainingCharacters = 134 - length;
            } else {
                smsText.defaultSize = 67;
                smsText.equivalence = Math.ceil(length / smsText.defaultSize);
                smsText.remainingCharacters = (smsText.defaultSize * smsText.equivalence) - length;
            }
        }

        if (smsText.equivalence > smsText.threshold) {
            if (smsText.coding === "7bit") {
                smsText.maxlength = ((smsText.threshold - 1) * 153) + 160;
            } else {
                smsText.maxlength = ((smsText.threshold - 1) * 64) + 70;
            }
            smsText.maxLengthReached = true;
        } else {
            smsText.maxlength = null;
            smsText.maxLengthReached = false;
        }

        return smsText;
    };

    /* -----  End of GET SMS INFO TEXT  ------*/

    /*= =====================================
        =            INITIALIZATION            =
        ======================================*/

    self.initAll = function (force) {
        if (self.initDeferred && !force) {
            return self.initDeferred.promise;
        }

        self.initDeferred = $q.defer();

        OvhApiSms.v6().query().$promise.then(function (smsIds) {
            return OvhApiSms.Aapi().detail({
                smsIds: smsIds
            }).$promise.then(function (smsDetails) {
                angular.forEach(smsDetails, function (smsDetail) {
                    addSmsService(smsDetail);
                });

                self.initDeferred.resolve(self.smsServices);
            });
        });

        return self.initDeferred.promise;
    };

    /* -----  End of INITIALIZATION  ------*/

});
