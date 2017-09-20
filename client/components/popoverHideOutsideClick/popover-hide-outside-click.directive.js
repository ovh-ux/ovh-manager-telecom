/**
 *  Trigger that can be used with uib popover to combine existing "none" open trigger with "outsideClick" close trigger.
 *  As we can't use "outsideClick" trigger to close popover with other defined triggers, we can use this directive to achieve this goal.
 *  Into your popover template add the directive to the root element and this will do the job : close popover when clicking outside it!
 */
angular.module("managerApp").directive("popoverHideOutsideClick", function ($parse, $timeout) {
    "use strict";

    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (!element.parents(".popover").length) {
                throw new Error("popoverHideOutsideClick directive must be wrapped into an uib popover.");
            }

            var handler = function (event) {
                if(!$(event.target).closest(element).length) {
                    scope.$apply(function () {
                        $parse(attrs.popoverHideOutsideClick)(scope);
                    });
                }
            };

            $timeout(function () {
                // Timeout is to prevent the click handler from immediately
                // firing upon opening the popover.
                $(document).on("click", handler);
            });

            scope.$on("$destroy", function () {
                $(document).off("click", handler);
            });
        }
    };

});
