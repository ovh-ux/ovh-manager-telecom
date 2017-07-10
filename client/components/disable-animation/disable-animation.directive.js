angular.module("managerApp")
    .directive("disableAnimation", function ($animate) {
        "use strict";

        // This is used in the caroussel disable-animation="true" to overcome incompatibility with ngAnimate
        return {
            restrict: "A",
            link: function ($scope, $element, $attrs) {
                $attrs.$observe("disableAnimation", function (value) {
                    $animate.enabled(!value, $element);
                });
            }
        };
    });
