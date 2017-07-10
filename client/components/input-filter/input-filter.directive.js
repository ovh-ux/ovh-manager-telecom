/**
 * Simple directive to restrict user input.
 *
 * Example :
 *
 *     <input input-filter="$ctrl.myFilter" />
 *
 *     $ctrl.myFilter = function (value) {
 *         return value.replace(/\w/g, "");
 *     };
 */
angular.module("managerApp").directive("inputFilter", function ($parse) {
    "use strict";

    return {
        require: "ngModel",
        restrict: "A",
        link: function (scope, elt, attrs, modelCtrl) {
            var handler = $parse(attrs.inputFilter)(scope);
            if (handler) {
                modelCtrl.$parsers.push(function (value) {
                    var filtered = handler(value);
                    if (filtered !== value) {
                        modelCtrl.$setViewValue(filtered);
                        modelCtrl.$render(filtered);
                    }
                    return filtered;
                });
            }
        }
    };
});
