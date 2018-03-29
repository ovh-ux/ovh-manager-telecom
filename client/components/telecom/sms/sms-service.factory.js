angular.module("managerApp").factory("SmsService", function (OvhApiSms) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function SmsService (optionsParam) {
        var options = optionsParam;

        if (!options) {
            options = {};
        }

        // options check
        if (!options.name) {
            throw new Error("name option must be specified when creating a new SmsService");
        }

        // mandatory
        this.name = options.name;

        // other options
        this.setInfos(options);

        // custom
        this.inEdition = false;
        this.saveForEdition = null;
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    SmsService.prototype.setInfos = function (options) {
        var self = this;

        angular.forEach(_.keys(options), function (optionKey) {
            self[optionKey] = options[optionKey];
        });

        return self;
    };

    SmsService.prototype.getDisplayedName = function () {
        var self = this;

        return self.description || self.name;
    };

    /* ----------  API CALLS  ----------*/

    SmsService.prototype.save = function () {
        var self = this;

        return OvhApiSms.v6().edit({
            serviceName: self.name
        }, {
            description: self.description
        }).$promise;
    };

    /* ----------  EDITION  ----------*/

    SmsService.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            description: angular.copy(self.description)
        };

        return self;
    };

    SmsService.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.description = angular.copy(self.saveForEdition.description);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return SmsService;

});
