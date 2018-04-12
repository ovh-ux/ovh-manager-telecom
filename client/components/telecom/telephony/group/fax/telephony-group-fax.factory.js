angular.module("managerApp").factory("TelephonyGroupFax", function ($q, OvhApiTelephony) {
    "use strict";

    /*= ==================================
    =            CONSTRUCTOR            =
    ===================================*/

    function TelephonyGroupFax (optionsParam) {
        var options = optionsParam;

        if (!options) {
            options = {};
        }

        // options check
        if (!options.billingAccount) {
            throw new Error("billingAccount option must be specified when creating a new TelephonyGroupFax");
        }

        if (!options.serviceName) {
            throw new Error("serviceName option must be specified when creating a new TelephonyGroupFax");
        }

        // mandatory
        this.billingAccount = options.billingAccount;
        this.serviceName = options.serviceName;

        // from API
        this.serviceType = options.serviceType;
        this.description = options.description;
        this.offers = options.offers;

        // managing notifications object
        this.notifications = options.notifications || {};
        if (_.isNull(_.get(this.notifications, "logs")) || _.isUndefined(_.get(this.notifications, "logs"))) {
            this.notifications.logs = {
                email: null,
                frequency: "Never",
                sendIfNull: false
            };
        }

        // custom attributes
        this.inEdition = false;
        this.saveForEdition = null;
        this.isFax = true;

        // helper
        this.isSip = _.some(this.offers, function (offer) {
            return angular.isString(offer) && offer.indexOf("sipfax") >= 0;
        });
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
    =            PROTOTYPE METHODS            =
    =========================================*/

    TelephonyGroupFax.prototype.getDisplayedName = function () {
        var self = this;

        return self.description || self.serviceName;
    };

    /* ----------  API CALLS  ----------*/

    TelephonyGroupFax.prototype.save = function () {
        var self = this;

        return OvhApiTelephony.Fax().v6().edit({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            description: self.description,
            notifications: self.notifications
        }).$promise;
    };

    TelephonyGroupFax.prototype.terminate = function (reason, details) {
        var self = this;

        return OvhApiTelephony.Service().v6().delete({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            reason: reason,
            details: details
        }).$promise;
    };

    TelephonyGroupFax.prototype.cancelTermination = function () {
        var self = this;

        return OvhApiTelephony.Service().v6().cancelTermination({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {}).$promise;
    };

    /* ----------  TASK  ----------*/

    TelephonyGroupFax.prototype.getTerminationTask = function () {
        var self = this;

        return OvhApiTelephony.Service().OfferTask().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            action: "termination",
            type: "offer"
        }).$promise.then(function (offerTaskIds) {
            return $q.all(_.map(offerTaskIds, function (id) {
                return OvhApiTelephony.Service().OfferTask().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    taskId: id
                }).$promise;
            })).then(function (tasks) {
                return _.head(_.filter(tasks, { status: "todo" }));
            });
        });
    };

    /* ----------  EDITION  ----------*/

    TelephonyGroupFax.prototype.startEdition = function () {
        var self = this;

        self.inEdition = true;

        self.saveForEdition = {
            description: angular.copy(self.description),
            notifications: angular.copy(self.notifications)
        };

        return self;
    };

    TelephonyGroupFax.prototype.stopEdition = function (cancel) {
        var self = this;

        if (self.saveForEdition && cancel) {
            self.description = angular.copy(self.saveForEdition.description);
            self.notifications = angular.copy(self.saveForEdition.notifications);
        }

        self.saveForEdition = null;
        self.inEdition = false;

        return self;
    };

    TelephonyGroupFax.prototype.hasChange = function (path) {
        var self = this;

        return _.get(self.saveForEdition, path) !== _.get(self, path);
    };

    /* -----  End of PROTOTYPE METHODS  ------*/

    return TelephonyGroupFax;

});
