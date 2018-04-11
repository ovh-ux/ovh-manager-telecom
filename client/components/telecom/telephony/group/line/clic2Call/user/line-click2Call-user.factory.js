angular.module("managerApp").factory("TelephonyGroupLineClick2CallUser", function ($q, OvhApiTelephony) {
    "use strict";

    var mandatoriesPhoneOptions = [
        "billingAccount",
        "serviceName"
    ];
    var mandatoryNb;

    /*= ==================================
        =            CONSTRUCTOR            =
        ===================================*/

    function TelephonyGroupLineClick2CallUser (mandatoryOptions, phoneOptionsParam) {
        var phoneOptions = phoneOptionsParam;

        mandatoryNb = mandatoriesPhoneOptions.length;
        if (!mandatoryOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupLineClick2CallUser");
        } else {
            for (mandatoryNb; mandatoryNb--;) {
                if (!mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]]) {
                    // check mandatory attributes
                    throw new Error(mandatoriesPhoneOptions[mandatoryNb] + " option must be specified when creating a new TelephonyGroupLineClick2CallUser");
                } else {
                    // set mandatory attributes
                    this[mandatoriesPhoneOptions[mandatoryNb]] = mandatoryOptions[mandatoriesPhoneOptions[mandatoryNb]];
                }
            }
        }

        if (!phoneOptions) {
            phoneOptions = {};
        }

        this.setInfos(phoneOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
        =            PROTOTYPE METHODS            =
        =========================================*/

    TelephonyGroupLineClick2CallUser.prototype.setInfos = function (options) {
        var self = this;
        angular.forEach(_.keys(options), function (optionKey) {
            self[optionKey] = options[optionKey];
        });

        return self;
    };

    TelephonyGroupLineClick2CallUser.prototype.getUser = function () {
        var self = this;
        return OvhApiTelephony.Line().Click2Call().User().v6().get({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }).$promise.then(function (phoneOptions) {
            return phoneOptions;
        }, function (error) {
            return $q.reject(error);
        });
    };

    TelephonyGroupLineClick2CallUser.prototype.call = function (calledNumber) {
        var self = this;

        return OvhApiTelephony.Line().Click2Call().User().v6().click2Call({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, {
            calledNumber: calledNumber
        }).$promise.then(function (voidResponse) {
            return voidResponse;
        }, function (error) {
            return $q.reject(error);
        });
    };

    TelephonyGroupLineClick2CallUser.prototype.add = function (userOptionsParam) {
        var self = this;
        var userOptions = userOptionsParam;

        if (!userOptions) {
            userOptions = {
                login: self.login,
                password: self.password
            };
        }

        return OvhApiTelephony.Line().Click2Call().User().v6().post({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }, userOptions
        ).$promise.then(function (voidResponse) {
            return voidResponse;
        }, function (error) {
            var message = error.data && error.data.message;
            return $q.reject(message);
        });
    };

    TelephonyGroupLineClick2CallUser.prototype.remove = function (userOptionsParam) {
        var self = this;
        var userOptions = userOptionsParam;

        if (!userOptions) {
            userOptions = {
                id: self.id
            };
        }

        return OvhApiTelephony.Line().Click2Call().User().v6().delete({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: userOptions.id
        }).$promise.then(function (voidResponse) {
            return voidResponse;
        }, function (error) {
            var message = error.data && error.data.message;
            return $q.reject(message);
        });
    };

    TelephonyGroupLineClick2CallUser.prototype.changePassword = function (password) {
        var self = this;

        return OvhApiTelephony.Line().Click2Call().User().v6().changePassword({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            id: self.id
        }, {
            password: password
        }).$promise.then(function (voidResponse) {
            return voidResponse;
        }, function (error) {
            var message = error.data && error.data.message;
            return $q.reject(message);
        });
    };

    return TelephonyGroupLineClick2CallUser;

}
);
