angular.module("managerApp").directive("ngPluralize", function () {
    "use strict";
    return {
        restrict: "EA",
        priority: 1,
        transclude: "element",
        link: function (scope, element, attrs, ctrl, transclude) {
            scope.$watch(attrs.when, function (when) {
                if (when) {
                    transclude(function (clone) {
                        element.replaceWith(clone);
                    });
                }
            });
        }
    };
});
