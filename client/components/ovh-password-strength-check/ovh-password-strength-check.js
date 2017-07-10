angular.module("ovhPasswordStrengthCheck", []).directive("ovhPasswordStrengthCheck", function () {
    "use strict";

    return {
        restrict: "A",
        require: "?ngModel",
        link: function ($scope, elem, attr, ngModel) {
            var tests = {};

            tests.oneLowercase = function (value) {
                return value.search(/[a-z]/g) !== -1;
            };

            tests.oneUppercase = function (value) {
                return value.search(/[A-Z]/g) !== -1;
            };

            tests.oneNumber = function (value) {
                return value.search(/[0-9]/g) !== -1;
            };

            tests.minChars = function (value) {
                return value.length >= 8;
            };

            $scope.$watch(function () {
                return ngModel.$modelValue;
            }, function (value) {
                var result;

                for (var test in tests) {
                    if (tests.hasOwnProperty(test)) {
                        result = false;
                        if (value) {
                            result = tests[test](value);
                        }
                        if (!result) {
                            ngModel.$error[test] = true;
                        } else {
                            delete ngModel.$error[test];
                        }
                    }
                }
                ngModel.$validate();
            });
        }
    };
});
