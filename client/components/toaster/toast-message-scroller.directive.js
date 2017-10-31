angular.module("managerApp").directive("toastMessageScroller", function ($window) {
    "use strict";

    return {
        restrict: "A",
        link: function (scope, element) {

            var delay = 250;
            var offset = -100;

            if ($window.scrollY > element.offset().top + offset) {
                $("html,body").animate({
                    scrollTop: Math.max(0, element.offset().top + offset)
                }, delay);
            }
        }
    };
});
