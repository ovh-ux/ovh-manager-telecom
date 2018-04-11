angular.module("managerApp").factory("TelephonyGroupLinePhoneFunction", function ($q, OvhApiTelephony) {
    "use strict";

    var mandatoriesPhoneFunctionOptions = [
        "billingAccount",
        "serviceName"
    ];
    var mandatoryNb;

    /*= ==================================
        =            CONSTRUCTOR            =
        ===================================*/

    function TelephonyGroupLineFunctionPhone (mandatoryOptions, phoneFunctionOptionsParam) {
        var phoneFunctionOptions = phoneFunctionOptionsParam;

        mandatoryNb = mandatoriesPhoneFunctionOptions.length;
        if (!mandatoryOptions) {
            throw new Error("mandatory options must be specified when creating a new TelephonyGroupLineFunctionPhone");
        } else {
            for (mandatoryNb; mandatoryNb--;) {
                if (!mandatoryOptions[mandatoriesPhoneFunctionOptions[mandatoryNb]]) {
                    // check mandatory attributes
                    throw new Error(mandatoriesPhoneFunctionOptions[mandatoryNb] + " option must be specified when creating a new TelephonyGroupLineFunctionPhone");
                } else {
                    // set mandatory attributes
                    this[mandatoriesPhoneFunctionOptions[mandatoryNb]] = mandatoryOptions[mandatoriesPhoneFunctionOptions[mandatoryNb]];
                }
            }
        }

        if (!phoneFunctionOptions) {
            phoneFunctionOptions = {};
        }

        this.function = null;
        this.label = null;
        this.default = null;
        this.type = null;
        this.keyNum = null;

        this.setPhoneFunctionInfos(phoneFunctionOptions);
    }

    /* -----  End of CONSTRUCTOR  ------*/

    /*= ========================================
        =            PROTOTYPE METHODS            =
        =========================================*/

    /* ----------  FEATURE OPTIONS  ----------*/

    TelephonyGroupLineFunctionPhone.prototype.setPhoneFunctionInfos = function (phoneFunctionOptions) {
        var self = this;

        angular.forEach(_.keys(phoneFunctionOptions), function (phoneFunctionOptionsKey) {
            if (phoneFunctionOptionsKey.indexOf("$") !== 0) {
                self[phoneFunctionOptionsKey] = phoneFunctionOptions[phoneFunctionOptionsKey];
            }
        });

        return self;
    };

    TelephonyGroupLineFunctionPhone.prototype.getAvailableFunctions = function () {
        var self = this;
        return OvhApiTelephony.Line().Phone().FunctionKey().v6().availableFunctions({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            keyNum: self.keyNum
        }).$promise.then(function (availableFunction) {
            return availableFunction;
        }, function (error) {
            var message = error.data && error.data.message;
            return $q.reject(message);
        });
    };

    TelephonyGroupLineFunctionPhone.prototype.save = function () {
        var self = this;

        return OvhApiTelephony.Line().Phone().FunctionKey().v6().save({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName,
            keyNum: self.keyNum
        }, {
            "function": self.function,
            parameter: self.parameter
        }).$promise.then(function (availableFunction) {
            return availableFunction;
        }, function (error) {
            var message = error.data && error.data.message;
            return $q.reject(message);
        });
    };

    TelephonyGroupLineFunctionPhone.prototype.getFunctions = function () {
        var self = this;
        var resultKeys = [];
        var requests = [];

        return OvhApiTelephony.Line().Phone().FunctionKey().v6().query({
            billingAccount: self.billingAccount,
            serviceName: self.serviceName
        }).$promise.then(function (functionKeys) {

            angular.forEach(functionKeys, function (key) {
                requests.push(OvhApiTelephony.Line().Phone().FunctionKey().v6().get({
                    billingAccount: self.billingAccount,
                    serviceName: self.serviceName,
                    keyNum: key
                }).$promise.then(function (keys) {
                    resultKeys.push(keys);
                    return resultKeys;
                }, function () {
                    return resultKeys;
                }));
            });

            return $q.all(requests).then(function () {
                return resultKeys;
            }, function () {
                return resultKeys;
            }).finally(function () {
                return resultKeys;
            });
        }, function () {
            return $q.when(resultKeys);
        });
    };

    return TelephonyGroupLineFunctionPhone;
}
);
