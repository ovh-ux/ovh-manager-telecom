angular.module("managerApp").directive("phoneNumber", function ($q, ValidateAapi, TelephonyMediator) {
    "use strict";
    return {
        require: "ngModel",
        link: function (scope, elm, attrs, ctrl) {

            /** Can't use isolate scope, $scompile.multidir**/
            var regionCode;
            var minLength;
            attrs.$observe("validationMinLength", function (val) {
                minLength = val;
            });
            attrs.$observe("regionCode", function (val) {
                regionCode = val;
            });

            ctrl.$asyncValidators.phoneNumber = function (modelValue, viewValue) {
                /** If i have region, i have to use 2api*/
                if (regionCode) {
                    if (!modelValue || modelValue.length < minLength) {
                        return $q.reject();
                    }

                    return ValidateAapi.phone({
                        phoneNumber: viewValue,
                        regionCode: attrs.regionCode
                    }).$promise;

                }

                /** Just use TelephonyMediator instead*/
                return $q.when(TelephonyMediator.IsValidNumber(modelValue)).then(function (isValid) {
                    if (isValid) {
                        return true;
                    }
                    return $q.reject(isValid);

                });

            };
        }
    };
});
