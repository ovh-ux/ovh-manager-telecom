/**
 *  Trigger that can be used with uib popover to combine existing "none" open trigger with "outsideClick" close trigger.
 *  As we can't use "outsideClick" trigger to close popover with other defined open triggers, we can use this directive to achieve this goal.
 *  Into your popover template add the directive to the root element and this will do the job : close popover when clicking outside it!
 */
angular.module("managerApp").directive("hideOutsideClick", function ($parse, $timeout) {
    "use strict";

    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var handler = function (event) {
                if(!$(event.target).closest(element).length) {
                    scope.$apply(function () {
                        $parse(attrs.hideOutsideClick)(scope);
                    });
                }
            };

            $timeout(function () {
                // Timeout is to prevent the click handler from immediately
                // firing upon opening the popover.
                $(document).on("mousedown", handler);
            });

            scope.$on("$destroy", function () {
                $(document).off("mousedown", handler);
            });
        }
    };

});
